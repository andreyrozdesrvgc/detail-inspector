from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import os
import logging
import html
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from digest import build_and_send_daily_digest, MOSCOW_TZ


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram configuration
TG_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
TG_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '').strip()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Detail Inspector — BMW Landing API")
api_router = APIRouter(prefix="/api")


# =========================
# Models
# =========================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class LeadCreate(BaseModel):
    name: Optional[str] = None
    phone: str
    bmw_model: Optional[str] = None
    task: Optional[str] = None
    condition: Optional[str] = None
    source: Optional[str] = "website"
    note: Optional[str] = None
    estimated_price: Optional[int] = None
    extra: Optional[Dict[str, Any]] = None


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    phone: str
    bmw_model: Optional[str] = None
    task: Optional[str] = None
    condition: Optional[str] = None
    source: Optional[str] = "website"
    note: Optional[str] = None
    estimated_price: Optional[int] = None
    extra: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CalculateRequest(BaseModel):
    bmw_model: str
    task: str
    condition: str


class CalculateResponse(BaseModel):
    estimated_price: int
    price_label: str
    gift: str
    summary: str


# =========================
# Pricing engine (deterministic)
# =========================
MODEL_BASE = {
    "X5 G05": 340000,
    "X6 G06": 360000,
    "X7 G07": 390000,
    "5 Series G60": 320000,
    "7 Series G70": 410000,
    "M3 / M4": 380000,
    "M5 G90": 420000,
    "iX / i7": 400000,
    "XM": 450000,
    "Другая модель": 350000,
}
TASK_MULT = {
    "Полная оклейка кузова": 1.00,
    "Зоны риска": 0.45,
    "Антигравий + антихром": 0.65,
    "Смена цвета": 1.35,
}
CONDITION_ADJ = {
    "Новый автомобиль": 0,
    "Есть сколы": 18000,
    "После другой студии": 35000,
}


# =========================
# Telegram notification
# =========================
def _format_lead_message(lead: Lead) -> str:
    """Build an HTML-formatted Telegram message with all collected lead info."""
    def esc(v: Any) -> str:
        return html.escape(str(v)) if v is not None and v != "" else "—"

    source_map = {
        "header": "Шапка сайта",
        "hero": "Hero блок",
        "comparison": "Блок сравнения",
        "mobile-menu": "Мобильное меню",
        "mobile-cta": "Мобильная CTA",
        "photo-cta": "Фото-блок",
        "exit-intent": "Exit-intent",
        "final-cta": "Финальный CTA",
        "guarantee": "Блок гарантий",
        "control": "Блок контроля",
        "calculator-default": "Калькулятор · отправка",
        "calculator-inspect": "Калькулятор · бесплатный осмотр",
        "calculator-consult": "Калькулятор · консультация",
    }
    src = lead.source or "website"
    if src.startswith("team-"):
        src_label = f"Карточка команды · {src.split('-', 1)[1]}"
    elif src.startswith("reel-"):
        src_label = f"Reels-кейс № {src.split('-', 1)[1]}"
    elif src.startswith("case-"):
        src_label = f"Кейс · {src.split('-', 1)[1]}"
    else:
        src_label = source_map.get(src, src)

    lines = [
        "<b>🚗 Новая заявка · Detail Inspector</b>",
        "",
        f"<b>Имя:</b> {esc(lead.name)}",
        f"<b>Телефон:</b> <code>{esc(lead.phone)}</code>",
    ]
    if lead.bmw_model:
        lines.append(f"<b>Модель BMW:</b> {esc(lead.bmw_model)}")
    if lead.task:
        lines.append(f"<b>Задача:</b> {esc(lead.task)}")
    if lead.condition:
        lines.append(f"<b>Состояние:</b> {esc(lead.condition)}")
    if lead.estimated_price:
        price_str = f"{int(lead.estimated_price):,}".replace(",", " ")
        lines.append(f"<b>Ориентировочно:</b> от {price_str} ₽")
    if lead.note:
        lines.append(f"<b>Комментарий:</b> {esc(lead.note)}")

    # Extra fields (e.g. quiz answers)
    if lead.extra and isinstance(lead.extra, dict):
        extra_filtered = {k: v for k, v in lead.extra.items() if v not in (None, "", [])}
        if extra_filtered:
            lines.append("")
            lines.append("<b>Доп. данные:</b>")
            for k, v in extra_filtered.items():
                lines.append(f"• <i>{esc(k)}</i>: {esc(v)}")

    lines.append("")
    lines.append(f"<b>Источник:</b> {esc(src_label)}")
    lines.append(f"<i>{lead.created_at.strftime('%d.%m.%Y %H:%M UTC')}</i>")
    return "\n".join(lines)


async def send_telegram_notification(lead: Lead) -> None:
    """Fire-and-forget Telegram notification. Errors are logged, never raised."""
    if not TG_TOKEN or not TG_CHAT_ID:
        logger.warning("Telegram disabled: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set")
        return

    text = _format_lead_message(lead)
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    payload = {
        "chat_id": TG_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as http:
            resp = await http.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Telegram error {resp.status_code}: {resp.text[:300]}")
            else:
                logger.info(f"Telegram OK · lead={lead.id} phone={lead.phone}")
    except Exception as e:
        logger.exception(f"Telegram send failed: {e}")


@api_router.get("/")
async def root():
    return {"message": "Detail Inspector BMW API"}


@api_router.get("/health")
async def health():
    return {
        "status": "ok",
        "ts": datetime.now(timezone.utc).isoformat(),
        "telegram_configured": bool(TG_TOKEN and TG_CHAT_ID),
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/calculate", response_model=CalculateResponse)
async def calculate_price(payload: CalculateRequest):
    base = MODEL_BASE.get(payload.bmw_model, 350000)
    mult = TASK_MULT.get(payload.task, 1.00)
    adj = CONDITION_ADJ.get(payload.condition, 0)
    price = int(round((base * mult + adj) / 1000) * 1000)
    label = f"{payload.task} {payload.bmw_model} — от {price:,} ₽".replace(",", " ")
    return CalculateResponse(
        estimated_price=price,
        price_label=label,
        gift="Бесплатная оклейка зоны погрузки",
        summary=f"{payload.bmw_model} · {payload.task} · {payload.condition}",
    )


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate, background: BackgroundTasks):
    if not payload.phone or len(payload.phone.strip()) < 5:
        raise HTTPException(status_code=400, detail="Phone is required")
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"New lead saved: {lead.phone} | {lead.bmw_model} | {lead.source}")
    # Send Telegram notification in background — never blocks response
    background.add_task(send_telegram_notification, lead)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 100):
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


@api_router.post("/telegram/test")
async def telegram_test():
    """Manual test endpoint to verify Telegram configuration."""
    if not TG_TOKEN or not TG_CHAT_ID:
        raise HTTPException(status_code=400, detail="Telegram not configured")
    test_lead = Lead(
        name="Тест",
        phone="+7 (000) 000-00-00",
        bmw_model="X5 G05",
        task="Полная оклейка кузова",
        condition="Новый автомобиль",
        estimated_price=340000,
        source="telegram-test",
        note="Это тестовое сообщение",
    )
    await send_telegram_notification(test_lead)
    return {"ok": True}


@api_router.post("/digest/send-now")
async def digest_send_now():
    """Manual trigger for the daily digest. Useful for testing & one-off reports."""
    ok = await build_and_send_daily_digest(db)
    return {"ok": ok}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Scheduler — daily digest at 00:00 MSK
# =========================
scheduler: Optional[AsyncIOScheduler] = None


@app.on_event("startup")
async def start_scheduler():
    global scheduler
    if os.environ.get("DAILY_DIGEST_ENABLED", "true").lower() not in ("1", "true", "yes"):
        logger.info("Daily digest scheduler disabled via env")
        return
    scheduler = AsyncIOScheduler(timezone=MOSCOW_TZ)
    # Fire at 00:00 Moscow time every day. This summarises the day that just ended.
    scheduler.add_job(
        lambda: build_and_send_daily_digest(db),
        trigger=CronTrigger(hour=0, minute=0, timezone=MOSCOW_TZ),
        id="daily-digest",
        name="Daily Telegram digest (00:00 MSK)",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — daily digest at 00:00 MSK")


@app.on_event("shutdown")
async def shutdown_db_client():
    global scheduler
    if scheduler:
        scheduler.shutdown(wait=False)
    client.close()
