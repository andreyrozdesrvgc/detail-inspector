from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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


@api_router.get("/")
async def root():
    return {"message": "Detail Inspector BMW API"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "ts": datetime.now(timezone.utc).isoformat()}


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
async def create_lead(payload: LeadCreate):
    if not payload.phone or len(payload.phone.strip()) < 5:
        raise HTTPException(status_code=400, detail="Phone is required")
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    logger.info(f"New lead saved: {lead.phone} | {lead.bmw_model} | {lead.source}")
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 100):
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
