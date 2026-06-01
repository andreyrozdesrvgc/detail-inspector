"""Telegram recipient management & long-polling for /start commands and
my_chat_member events.

Why a separate module?
----------------------
Out of the box our backend only sends Telegram messages — it never *reads*
updates from Telegram. To make the bot:
  • respond to /start in private chats,
  • auto-register groups when an admin adds the bot,
  • forget chats where the bot was kicked,
we run a lightweight long-poll in a background task. Every recipient
(chat_id) is stored in Mongo, and `get_recipients()` returns a deduplicated
list that includes the env-level TELEGRAM_CHAT_ID as the default owner.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)


def _client_kwargs(timeout: float = 30.0) -> Dict[str, Any]:
    proxy = os.environ.get("TELEGRAM_PROXY", "").strip() or None
    kw: Dict[str, Any] = {"timeout": timeout}
    if proxy:
        kw["proxy"] = proxy
    return kw


async def get_recipients(db) -> List[str]:
    """Return every chat_id the bot should broadcast to.

    Includes:
      • TELEGRAM_CHAT_ID from .env (owner / fallback) — always first
      • all rows from `tg_recipients` collection
    The list is deduplicated, order preserved.
    """
    seen = set()
    out: List[str] = []
    env_chat = (os.environ.get("TELEGRAM_CHAT_ID") or "").strip()
    if env_chat:
        out.append(env_chat)
        seen.add(env_chat)
    try:
        cursor = db.tg_recipients.find({}, {"_id": 0, "chat_id": 1})
        async for doc in cursor:
            cid = str(doc.get("chat_id") or "").strip()
            if cid and cid not in seen:
                out.append(cid)
                seen.add(cid)
    except Exception as e:
        logger.exception(f"get_recipients failed: {e}")
    return out


async def upsert_recipient(db, chat: Dict[str, Any]) -> None:
    """Persist a chat as a recipient. Idempotent."""
    chat_id = str(chat.get("id"))
    title = chat.get("title") or chat.get("first_name") or chat.get("username") or ""
    try:
        await db.tg_recipients.update_one(
            {"chat_id": chat_id},
            {
                "$set": {
                    "chat_id": chat_id,
                    "type": chat.get("type"),
                    "title": title,
                    "username": chat.get("username"),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                },
                "$setOnInsert": {
                    "added_at": datetime.now(timezone.utc).isoformat(),
                },
            },
            upsert=True,
        )
        logger.info(f"Telegram recipient saved: {chat_id} ({title})")
    except Exception as e:
        logger.exception(f"upsert_recipient failed: {e}")


async def remove_recipient(db, chat_id: Any) -> None:
    try:
        await db.tg_recipients.delete_one({"chat_id": str(chat_id)})
        logger.info(f"Telegram recipient removed: {chat_id}")
    except Exception:
        pass


async def _get_offset(db) -> Optional[int]:
    try:
        doc = await db.tg_state.find_one({"_id": "poll"})
        if doc and "offset" in doc:
            return int(doc["offset"])
    except Exception:
        pass
    return None


async def _set_offset(db, offset: int) -> None:
    try:
        await db.tg_state.update_one(
            {"_id": "poll"},
            {"$set": {"offset": int(offset), "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass


async def _send_welcome(token: str, chat_id: str) -> None:
    """Confirm /start so the user sees the bot is alive."""
    text = (
        "<b>✅ Detail Inspector Leads · готов к работе</b>\n\n"
        "Этот чат добавлен в список получателей. "
        "Все новые заявки с сайта будут приходить сюда автоматически."
    )
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(**_client_kwargs(timeout=10.0)) as http:
            await http.post(url, json={
                "chat_id": chat_id, "text": text, "parse_mode": "HTML",
                "disable_web_page_preview": True,
            })
    except Exception:
        pass


async def poll_telegram_updates(db) -> None:
    """One pass of getUpdates. Designed to be called by APScheduler every ~15s.

    Long-polling timeout is intentionally short (10s) so APScheduler isn't
    blocked. The Telegram offset is stored in Mongo, so updates aren't lost
    between restarts.
    """
    token = (os.environ.get("TELEGRAM_BOT_TOKEN") or "").strip()
    if not token:
        return
    offset = await _get_offset(db)
    params: Dict[str, Any] = {
        "timeout": 10,
        "allowed_updates": '["message","my_chat_member"]',
    }
    if offset is not None:
        params["offset"] = offset + 1

    url = f"https://api.telegram.org/bot{token}/getUpdates"
    try:
        # Slightly longer client-side timeout than long-poll itself.
        async with httpx.AsyncClient(**_client_kwargs(timeout=20.0)) as http:
            resp = await http.get(url, params=params)
            if resp.status_code != 200:
                logger.warning(f"getUpdates {resp.status_code}: {resp.text[:200]}")
                return
            data = resp.json()
            if not data.get("ok"):
                logger.warning(f"getUpdates not ok: {data}")
                return
            updates = data.get("result") or []
    except Exception as e:
        logger.exception(f"getUpdates failed: {e}")
        return

    last_id: Optional[int] = None
    for upd in updates:
        last_id = upd.get("update_id")

        # 1) /start in private OR plain message in a group — register the chat.
        msg = upd.get("message")
        if msg:
            chat = msg.get("chat") or {}
            text = (msg.get("text") or "").strip()
            if text.startswith("/start"):
                await upsert_recipient(db, chat)
                await _send_welcome(token, str(chat.get("id")))

        # 2) Bot added/removed from a group/supergroup/channel.
        mcm = upd.get("my_chat_member")
        if mcm:
            chat = mcm.get("chat") or {}
            new_status = (mcm.get("new_chat_member") or {}).get("status")
            if new_status in ("member", "administrator", "creator"):
                await upsert_recipient(db, chat)
                # Greet the group so admins see the bot is wired up.
                await _send_welcome(token, str(chat.get("id")))
            elif new_status in ("kicked", "left"):
                await remove_recipient(db, chat.get("id"))

    if last_id is not None:
        await _set_offset(db, last_id)
