"""Yandex Metrika API client + daily Telegram digest job."""
from __future__ import annotations

import asyncio
import html
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import httpx
import pytz

logger = logging.getLogger(__name__)

MOSCOW_TZ = pytz.timezone("Europe/Moscow")

# Pre-compiled aliases — match the frontend list so the digest groups
# the same raw utm_source values under the same label.
SOURCE_ALIASES = {
    "vk": "ВК Реклама",
    "vk_ads": "ВК Реклама",
    "vkads": "ВК Реклама",
    "avito": "Авито",
    "avito_ads": "Авито Реклама",
    "yandex": "Яндекс Директ",
    "direct": "Яндекс Директ",
    "yandex_direct": "Яндекс Директ",
    "ya_direct": "Яндекс Директ",
    "google": "Google Ads",
    "instagram": "Instagram",
    "telegram": "Telegram",
    "email": "Email",
}


def alias_source(raw: Optional[str]) -> str:
    if not raw:
        return "Прямой заход / без UTM"
    key = str(raw).lower().strip()
    return SOURCE_ALIASES.get(key, raw)


def moscow_now() -> datetime:
    return datetime.now(MOSCOW_TZ)


def moscow_day_bounds(at: Optional[datetime] = None):
    """Return (start_utc, end_utc) for the MSK calendar day containing `at`.

    Used to bucket leads from "today" in Moscow time even though we store UTC.
    """
    at = at or moscow_now()
    start_msk = at.replace(hour=0, minute=0, second=0, microsecond=0)
    end_msk = start_msk + timedelta(days=1)
    return start_msk.astimezone(timezone.utc), end_msk.astimezone(timezone.utc)


# ============================================================
# Yandex Metrika API
# ============================================================

class MetrikaClient:
    """Minimal async client for Yandex.Metrika Reporting API."""

    BASE = "https://api-metrika.yandex.net/stat/v1/data"

    def __init__(self, counter_id: str, oauth_token: str) -> None:
        self.counter_id = counter_id
        self.oauth_token = oauth_token

    @property
    def configured(self) -> bool:
        return bool(self.counter_id and self.oauth_token)

    async def _get(self, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.configured:
            return None
        params = {"ids": self.counter_id, **params}
        headers = {"Authorization": f"OAuth {self.oauth_token}"}
        try:
            async with httpx.AsyncClient(timeout=15.0) as http:
                resp = await http.get(self.BASE, params=params, headers=headers)
                if resp.status_code != 200:
                    logger.error(
                        f"Metrika API error {resp.status_code}: {resp.text[:300]}"
                    )
                    return None
                return resp.json()
        except Exception as e:
            logger.exception(f"Metrika request failed: {e}")
            return None

    async def fetch_today_totals(self) -> Optional[Dict[str, float]]:
        """Visits / users / pageviews / bounce rate for today (MSK)."""
        data = await self._get({
            "metrics": "ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds",
            "date1": "today",
            "date2": "today",
            "accuracy": "full",
        })
        if not data:
            return None
        totals = data.get("totals", [[]])
        row = totals[0] if totals else []
        if len(row) < 5:
            return None
        return {
            "visits": int(row[0] or 0),
            "users": int(row[1] or 0),
            "pageviews": int(row[2] or 0),
            "bounce_rate": float(row[3] or 0),
            "avg_duration_sec": float(row[4] or 0),
        }

    async def fetch_today_sources(self, limit: int = 5) -> Optional[List[Dict[str, Any]]]:
        """Top traffic sources today: search engines, ads, direct, social, etc."""
        data = await self._get({
            "metrics": "ym:s:visits,ym:s:users",
            "dimensions": "ym:s:lastTrafficSource",
            "date1": "today",
            "date2": "today",
            "sort": "-ym:s:visits",
            "limit": limit,
        })
        if not data:
            return None
        out = []
        for row in data.get("data", []):
            dim = (row.get("dimensions") or [{}])[0]
            metrics = row.get("metrics") or [0, 0]
            out.append({
                "source": dim.get("name", "—"),
                "visits": int(metrics[0] or 0),
                "users": int(metrics[1] or 0),
            })
        return out


# ============================================================
# Lead aggregation
# ============================================================

async def aggregate_leads_today(db) -> Dict[str, Any]:
    """Pull today (MSK) leads and group by source/UTM."""
    start_utc, end_utc = moscow_day_bounds()
    start_iso = start_utc.isoformat()
    end_iso = end_utc.isoformat()

    cursor = db.leads.find(
        {"created_at": {"$gte": start_iso, "$lt": end_iso}},
        {"_id": 0},
    )
    leads = await cursor.to_list(length=2000)

    by_utm: Dict[str, int] = {}
    by_section: Dict[str, int] = {}
    bmw_models: Dict[str, int] = {}
    total_price = 0
    priced_count = 0

    for lead in leads:
        # 1) UTM-based source (ad attribution)
        extra = lead.get("extra") or {}
        utm_src = None
        if isinstance(extra, dict):
            utm_src = extra.get("utm_source") or extra.get("UTM Источник")
        label = alias_source(utm_src)
        by_utm[label] = by_utm.get(label, 0) + 1

        # 2) On-site section that produced the lead
        src = lead.get("source") or "website"
        section = _section_label(src)
        by_section[section] = by_section.get(section, 0) + 1

        # 3) BMW model interest
        model = lead.get("bmw_model")
        if model:
            bmw_models[model] = bmw_models.get(model, 0) + 1

        # 4) Estimated price
        price = lead.get("estimated_price")
        if isinstance(price, (int, float)) and price > 0:
            total_price += price
            priced_count += 1

    return {
        "total": len(leads),
        "by_utm_source": _sorted(by_utm),
        "by_section": _sorted(by_section),
        "bmw_models": _sorted(bmw_models),
        "avg_estimated_price": int(total_price / priced_count) if priced_count else 0,
    }


def _sorted(d: Dict[str, int]) -> List[tuple]:
    return sorted(d.items(), key=lambda x: -x[1])


def _section_label(raw: str) -> str:
    mapping = {
        "header": "Шапка сайта",
        "hero": "Hero",
        "comparison": "Сравнение",
        "mobile-menu": "Мобильное меню",
        "mobile-cta": "Мобильная CTA",
        "photo-cta": "Фото CTA",
        "exit-intent": "Exit-intent",
        "final-cta": "Финальный CTA",
        "guarantee": "Гарантии",
        "control": "Контроль",
        "calculator-default": "Калькулятор (расчёт)",
        "calculator-inspect": "Калькулятор (осмотр)",
        "calculator-consult": "Калькулятор (консультация)",
        "website": "Сайт",
    }
    if raw.startswith("reel-"):
        return "Reels-кейсы"
    if raw.startswith("case-"):
        return "Карточка кейса"
    if raw.startswith("team-"):
        return "Карточка команды"
    return mapping.get(raw, raw)


# ============================================================
# Digest message formatting
# ============================================================

def _fmt_int(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def _bar(value: int, max_value: int, width: int = 8) -> str:
    if max_value <= 0:
        return ""
    filled = round((value / max_value) * width)
    return "█" * filled + "░" * (width - filled)


def format_digest(
    leads_stats: Dict[str, Any],
    metrika: Optional[Dict[str, Any]],
    metrika_sources: Optional[List[Dict[str, Any]]],
    metrika_configured: bool,
) -> str:
    now_msk = moscow_now()
    date_label = now_msk.strftime("%d.%m.%Y")

    lines = []
    lines.append("<b>📊 Detail Inspector — итоги дня</b>")
    lines.append(f"<i>{date_label} · Москва</i>")
    lines.append("")

    # ---------- Leads ----------
    total = leads_stats["total"]
    avg_price = leads_stats["avg_estimated_price"]
    lines.append("<b>━━ ЗАЯВКИ С САЙТА ━━</b>")
    if total == 0:
        lines.append("Сегодня заявок не было.")
    else:
        lines.append(f"📨 Всего: <b>{total}</b>")
        if avg_price:
            lines.append(f"💰 Средний чек (предварительно): <b>от {_fmt_int(avg_price)} ₽</b>")
    lines.append("")

    # ---------- Source breakdown (UTM) ----------
    by_utm = leads_stats["by_utm_source"]
    if by_utm:
        lines.append("<b>━━ ИСТОЧНИКИ ЗАЯВОК ━━</b>")
        max_v = max(v for _, v in by_utm)
        for label, count in by_utm:
            bar = _bar(count, max_v)
            lines.append(f"<code>{bar}</code> {html.escape(label)} — <b>{count}</b>")
        lines.append("")

    # ---------- Sections on site ----------
    by_section = leads_stats["by_section"]
    if by_section:
        lines.append("<b>━━ ОТКУДА КЛИКАЛИ НА САЙТЕ ━━</b>")
        for label, count in by_section[:6]:
            lines.append(f"• {html.escape(label)} — <b>{count}</b>")
        lines.append("")

    # ---------- BMW models interest ----------
    by_model = leads_stats["bmw_models"]
    if by_model:
        lines.append("<b>━━ ИНТЕРЕС ПО МОДЕЛЯМ BMW ━━</b>")
        for model, count in by_model[:5]:
            lines.append(f"• {html.escape(model)} — <b>{count}</b>")
        lines.append("")

    # ---------- Yandex Metrika ----------
    lines.append("<b>━━ ЯНДЕКС.МЕТРИКА ━━</b>")
    if not metrika_configured:
        lines.append("<i>API-токен Метрики не настроен.</i>")
        lines.append("<i>Добавьте YANDEX_METRIKA_OAUTH_TOKEN в .env</i>")
    elif metrika is None:
        lines.append("⚠️ Не удалось получить данные из Метрики (проверьте токен).")
    else:
        bounce = metrika.get("bounce_rate", 0)
        avg_dur = int(metrika.get("avg_duration_sec", 0))
        mm, ss = divmod(avg_dur, 60)
        lines.append(f"👥 Посетителей: <b>{_fmt_int(metrika['users'])}</b>")
        lines.append(f"👀 Визитов: <b>{_fmt_int(metrika['visits'])}</b>")
        lines.append(f"📄 Просмотров: <b>{_fmt_int(metrika['pageviews'])}</b>")
        lines.append(f"⏱ Среднее время: <b>{mm}:{ss:02d}</b>")
        lines.append(f"↩️ Отказы: <b>{bounce:.1f}%</b>")
        # Conversion rate
        if metrika["visits"] > 0 and total > 0:
            cr = (total / metrika["visits"]) * 100
            lines.append(f"🎯 Конверсия в заявку: <b>{cr:.2f}%</b>")
    lines.append("")

    # ---------- Top sources from Metrika ----------
    if metrika_sources:
        lines.append("<b>━━ ТРАФИК ПО МЕТРИКЕ ━━</b>")
        for s in metrika_sources:
            lines.append(
                f"• {html.escape(s['source'])} — <b>{s['visits']}</b> визитов / {s['users']} польз."
            )
        lines.append("")

    lines.append("<i>Сформировано автоматически в 00:00 МСК.</i>")
    return "\n".join(lines)


# ============================================================
# Sender
# ============================================================

async def send_telegram_html(token: str, chat_id: str, text: str) -> bool:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as http:
            resp = await http.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Digest send error {resp.status_code}: {resp.text[:400]}")
                return False
            return True
    except Exception as e:
        logger.exception(f"Digest send failed: {e}")
        return False


async def build_and_send_daily_digest(db) -> bool:
    """Compose today's digest and ship it to Telegram. Returns True on success."""
    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    tg_chat = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not (tg_token and tg_chat):
        logger.warning("Daily digest skipped: Telegram not configured")
        return False

    counter = os.environ.get("YANDEX_METRIKA_COUNTER_ID", "").strip()
    oauth = os.environ.get("YANDEX_METRIKA_OAUTH_TOKEN", "").strip()
    metrika = MetrikaClient(counter, oauth)

    leads_task = aggregate_leads_today(db)
    if metrika.configured:
        totals_task = metrika.fetch_today_totals()
        sources_task = metrika.fetch_today_sources(limit=5)
        leads_stats, m_totals, m_sources = await asyncio.gather(
            leads_task, totals_task, sources_task
        )
    else:
        leads_stats = await leads_task
        m_totals, m_sources = None, None

    text = format_digest(
        leads_stats=leads_stats,
        metrika=m_totals,
        metrika_sources=m_sources,
        metrika_configured=metrika.configured,
    )
    return await send_telegram_html(tg_token, tg_chat, text)
