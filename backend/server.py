from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, File, UploadFile, Form
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
from telegram_recipients import (
    get_recipients,
    poll_telegram_updates,
)


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
    telegram_sent: Optional[bool] = False


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


async def _claim_lead_for_send(lead_id: str) -> bool:
    """Atomically mark a lead as sent BEFORE attempting delivery.

    Returns True only if this caller successfully claimed the lead.
    Anyone else trying to (re)send the same lead will get False and bail.
    If the actual Telegram send fails afterwards, the caller is responsible
    for resetting the flag via `_release_lead_on_failure`.
    """
    try:
        result = await db.leads.update_one(
            {
                "id": lead_id,
                "$or": [
                    {"telegram_sent": {"$ne": True}},
                    {"telegram_sent": {"$exists": False}},
                ],
            },
            {"$set": {"telegram_sent": True}},
        )
        return result.modified_count > 0
    except Exception as e:
        logger.exception(f"_claim_lead_for_send failed: {e}")
        return False


async def _release_lead_on_failure(lead_id: str) -> None:
    try:
        await db.leads.update_one({"id": lead_id}, {"$set": {"telegram_sent": False}})
    except Exception:
        pass


async def send_telegram_notification(lead: Lead) -> bool:
    """Fire-and-forget Telegram notification.

    Broadcasts the lead to every recipient registered via /start or by
    adding the bot to a group. Uses an atomic Mongo claim to guarantee
    each lead is sent exactly once, even if the auto-retry job races
    with the primary send.
    """
    if not TG_TOKEN:
        logger.warning("Telegram disabled: TELEGRAM_BOT_TOKEN not set")
        return False

    # Atomically claim the lead — if someone else is already sending it, bail.
    if not await _claim_lead_for_send(lead.id):
        logger.info(f"Telegram skip · lead={lead.id} already claimed")
        return False

    chat_ids = await get_recipients(db)
    if not chat_ids:
        logger.warning("Telegram disabled: no recipients configured")
        await _release_lead_on_failure(lead.id)
        return False

    text = _format_lead_message(lead)
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    proxy = os.environ.get("TELEGRAM_PROXY", "").strip() or None
    client_kwargs = {"timeout": 10.0}
    if proxy:
        client_kwargs["proxy"] = proxy

    any_ok = False
    try:
        async with httpx.AsyncClient(**client_kwargs) as http:
            for cid in chat_ids:
                try:
                    resp = await http.post(url, json={
                        "chat_id": cid,
                        "text": text,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True,
                    })
                    if resp.status_code == 200:
                        any_ok = True
                        logger.info(f"Telegram OK · lead={lead.id} chat={cid}")
                    else:
                        logger.error(f"Telegram error {resp.status_code} chat={cid}: {resp.text[:200]}")
                        # 403 = bot kicked / blocked → drop the recipient so we don't keep failing.
                        if resp.status_code == 403:
                            try:
                                await db.tg_recipients.delete_one({"chat_id": str(cid)})
                            except Exception:
                                pass
                except Exception as e:
                    logger.exception(f"Telegram send to {cid} failed: {e}")
    except Exception as e:
        logger.exception(f"Telegram broadcast failed: {e}")

    if not any_ok:
        # Release the claim so the retry job can try again later.
        await _release_lead_on_failure(lead.id)
    return any_ok


@api_router.get("/")
async def root():
    return {"message": "Detail Inspector BMW API"}


@api_router.get("/health")
async def health():
    # Check how many leads are awaiting Telegram delivery — a fast warning signal.
    pending = 0
    try:
        pending = await db.leads.count_documents({
            "$or": [{"telegram_sent": {"$ne": True}}, {"telegram_sent": {"$exists": False}}]
        })
    except Exception:
        pass
    return {
        "status": "ok",
        "ts": datetime.now(timezone.utc).isoformat(),
        "telegram_configured": bool(TG_TOKEN and TG_CHAT_ID),
        "telegram_proxy": bool(os.environ.get("TELEGRAM_PROXY", "").strip()),
        "leads_pending_telegram": pending,
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
    # Phone validation — must contain at least 10 digits (RU number).
    raw_digits = ''.join(ch for ch in (payload.phone or '') if ch.isdigit())
    if len(raw_digits) < 10:
        raise HTTPException(status_code=400, detail="Phone is required")
    # BMW model is mandatory (free-form: latin, cyrillic, digits — anything non-empty).
    if not payload.bmw_model or len(payload.bmw_model.strip()) < 1:
        raise HTTPException(status_code=400, detail="BMW model is required")
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"New lead saved: {lead.phone} | {lead.bmw_model} | {lead.source}")
    # Send Telegram notification in background — never blocks response
    background.add_task(send_telegram_notification, lead)
    return lead


async def send_telegram_photo(lead: Lead, file_bytes: bytes, filename: str) -> bool:
    """Send the lead's car photo to all recipients with the full lead info as caption."""
    if not TG_TOKEN:
        return False
    # Same atomic claim as text notifications — prevents duplicate sends from retry.
    if not await _claim_lead_for_send(lead.id):
        logger.info(f"Telegram photo skip · lead={lead.id} already claimed")
        return False

    chat_ids = await get_recipients(db)
    if not chat_ids:
        await _release_lead_on_failure(lead.id)
        return False
    caption = _format_lead_message(lead)
    if len(caption) > 1000:
        caption = caption[:990] + "…"
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendPhoto"
    proxy = os.environ.get("TELEGRAM_PROXY", "").strip() or None
    client_kwargs = {"timeout": 30.0}
    if proxy:
        client_kwargs["proxy"] = proxy

    any_ok = False
    try:
        async with httpx.AsyncClient(**client_kwargs) as http:
            for cid in chat_ids:
                try:
                    resp = await http.post(
                        url,
                        data={"chat_id": cid, "caption": caption, "parse_mode": "HTML"},
                        files={"photo": (filename, file_bytes)},
                    )
                    if resp.status_code == 200:
                        any_ok = True
                        logger.info(f"Telegram photo OK · lead={lead.id} chat={cid}")
                    else:
                        logger.error(f"Telegram photo error {resp.status_code} chat={cid}: {resp.text[:200]}")
                        if resp.status_code == 403:
                            try:
                                await db.tg_recipients.delete_one({"chat_id": str(cid)})
                            except Exception:
                                pass
                except Exception as e:
                    logger.exception(f"Telegram photo send to {cid} failed: {e}")
    except Exception as e:
        logger.exception(f"Telegram photo broadcast failed: {e}")

    if not any_ok:
        await _release_lead_on_failure(lead.id)
    return any_ok


@api_router.post("/leads/upload")
async def create_lead_with_photo(
    background: BackgroundTasks,
    phone: str = Form(...),
    bmw_model: str = Form(...),
    name: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    source: Optional[str] = Form("photo-form"),
    extra: Optional[str] = Form(None),  # JSON-encoded extra dict from frontend
    photo: Optional[UploadFile] = File(None),
):
    """Lead form with optional car photo. Photo is forwarded to Telegram inline."""
    raw_digits = ''.join(ch for ch in (phone or '') if ch.isdigit())
    if len(raw_digits) < 10:
        raise HTTPException(status_code=400, detail="Phone is required")
    if not bmw_model or len(bmw_model.strip()) < 1:
        raise HTTPException(status_code=400, detail="BMW model is required")

    parsed_extra: Dict[str, Any] = {}
    if extra:
        try:
            import json
            parsed_extra = json.loads(extra) or {}
        except Exception:
            parsed_extra = {"_raw_extra": extra}

    # Read photo bytes (if any) and basic validation: max 8 MB, image MIME.
    file_bytes: Optional[bytes] = None
    filename = "photo.jpg"
    if photo is not None and photo.filename:
        content_type = (photo.content_type or "").lower()
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        file_bytes = await photo.read()
        if len(file_bytes) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Photo is too large (max 8 MB)")
        filename = photo.filename or "photo.jpg"
        parsed_extra["Фото"] = f"приложено ({filename}, {len(file_bytes)//1024} КБ)"

    lead = Lead(
        name=name,
        phone=phone,
        bmw_model=bmw_model,
        source=source or "photo-form",
        note=note,
        extra=parsed_extra,
    )
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"Photo-lead saved: {lead.phone} | {lead.bmw_model} | photo={bool(file_bytes)}")

    # Telegram delivery — sendPhoto if photo attached, else regular message.
    if file_bytes:
        background.add_task(send_telegram_photo, lead, file_bytes, filename)
    else:
        background.add_task(send_telegram_notification, lead)
    return {"ok": True, "lead_id": lead.id}


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 100):
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


@api_router.post("/leads/resend-pending")
async def resend_pending_leads(limit: int = 200):
    """Re-send Telegram notification for all leads that weren't delivered yet.

    Triggered manually after the proxy goes down to recover lost notifications,
    and also on a background timer (see scheduler below).
    """
    cursor = db.leads.find(
        {"$or": [{"telegram_sent": {"$ne": True}}, {"telegram_sent": {"$exists": False}}]},
        {"_id": 0},
    ).sort("created_at", 1).limit(limit)
    pending = await cursor.to_list(limit)

    sent = 0
    failed = 0
    for doc in pending:
        if isinstance(doc.get("created_at"), str):
            try:
                doc["created_at"] = datetime.fromisoformat(doc["created_at"])
            except Exception:
                doc["created_at"] = datetime.now(timezone.utc)
        lead = Lead(**doc)
        ok = await send_telegram_notification(lead)
        if ok:
            sent += 1
        else:
            failed += 1
    logger.info(f"resend-pending: sent={sent} failed={failed} total_pending={len(pending)}")
    return {"total_pending": len(pending), "sent": sent, "failed": failed}


@api_router.get("/telegram/recipients")
async def telegram_recipients_list():
    """List all registered Telegram recipients (env owner + chats that pressed /start)."""
    chat_ids = await get_recipients(db)
    saved = await db.tg_recipients.find({}, {"_id": 0}).to_list(200)
    return {
        "count": len(chat_ids),
        "chat_ids": chat_ids,
        "saved": saved,
        "env_owner": os.environ.get("TELEGRAM_CHAT_ID", ""),
    }


class RecipientIn(BaseModel):
    chat_id: str
    title: Optional[str] = None


@api_router.post("/telegram/recipients/add")
async def telegram_recipient_add(payload: RecipientIn):
    """Manually register a chat_id as a recipient (fallback if polling fails).

    Tips:
      • Private chat — your numeric user id (use @userinfobot to find it).
      • Group / supergroup — usually a negative number like -100123456789.
        Add the bot to the group first, then ask @username_to_id_bot or
        @getidsbot for the chat id.
    """
    chat = {"id": payload.chat_id, "title": payload.title or "manual", "type": "manual"}
    from telegram_recipients import upsert_recipient
    await upsert_recipient(db, chat)
    # Greet so they know it's wired up.
    if TG_TOKEN:
        url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
        proxy = os.environ.get("TELEGRAM_PROXY", "").strip() or None
        kwargs = {"timeout": 10.0}
        if proxy:
            kwargs["proxy"] = proxy
        try:
            async with httpx.AsyncClient(**kwargs) as http:
                await http.post(url, json={
                    "chat_id": payload.chat_id,
                    "text": "<b>✅ Detail Inspector Leads · готов к работе</b>\n\nЧат подключён вручную. Заявки будут приходить сюда.",
                    "parse_mode": "HTML",
                })
        except Exception:
            pass
    return {"ok": True}


@api_router.post("/telegram/recipients/remove")
async def telegram_recipient_remove(payload: RecipientIn):
    await db.tg_recipients.delete_one({"chat_id": str(payload.chat_id)})
    return {"ok": True}


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

    # Safety net — every 5 minutes try to resend any leads that didn't reach
    # Telegram (e.g. WARP proxy went down or Telegram API rate-limited us).
    async def _retry_pending():
        try:
            cursor = db.leads.find(
                {"$or": [{"telegram_sent": {"$ne": True}}, {"telegram_sent": {"$exists": False}}]},
                {"_id": 0},
            ).sort("created_at", 1).limit(50)
            pending = await cursor.to_list(50)
            for doc in pending:
                if isinstance(doc.get("created_at"), str):
                    try:
                        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
                    except Exception:
                        doc["created_at"] = datetime.now(timezone.utc)
                lead = Lead(**doc)
                await send_telegram_notification(lead)
        except Exception as e:
            logger.exception(f"Auto resend-pending failed: {e}")

    scheduler.add_job(
        _retry_pending,
        trigger="interval",
        minutes=1,
        id="resend-pending-leads",
        name="Auto retry undelivered Telegram leads (every 1 min)",
        replace_existing=True,
    )

    # Long-poll Telegram getUpdates to learn about /start commands and
    # bot-added-to-group events. Every 15 seconds is plenty.
    scheduler.add_job(
        lambda: poll_telegram_updates(db),
        trigger="interval",
        seconds=15,
        id="telegram-poll",
        name="Poll Telegram for /start & chat membership",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()
    logger.info("Scheduler started — digest 00:00 MSK + resend 1min + tg-poll 15s")


@app.on_event("shutdown")
async def shutdown_db_client():
    global scheduler
    if scheduler:
        scheduler.shutdown(wait=False)
    client.close()
