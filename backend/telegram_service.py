import logging
import os
from html import escape

import httpx

logger = logging.getLogger(__name__)
API = "https://api.telegram.org/bot{token}/{method}"


def _token():
    return os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()


async def _call(method: str, **payload) -> dict:
    token = _token()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN tanımlı değil")
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(API.format(token=token, method=method), json=payload)
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(data.get("description", "Telegram hatası"))
    return data


async def send_telegram(chat_id: str, text: str) -> bool:
    try:
        await _call("sendMessage", chat_id=chat_id, text=text, parse_mode="HTML", disable_web_page_preview=True)
        return True
    except Exception as e:
        logger.error(f"Telegram send failed: {e}")
        return False


async def recent_chats() -> list:
    data = await _call("getUpdates", limit=50)
    chats = {}
    for u in data.get("result", []):
        msg = u.get("message") or u.get("channel_post") or u.get("my_chat_member") or {}
        chat = msg.get("chat") or {}
        if chat.get("id"):
            name = chat.get("title") or " ".join(x for x in [chat.get("first_name"), chat.get("last_name")] if x) or chat.get("username", "")
            chats[str(chat["id"])] = {"id": str(chat["id"]), "name": name, "type": chat.get("type", "")}
    return list(chats.values())


def quote_telegram_text(q: dict, company: str) -> str:
    rows = [("👤 Ad Soyad", q.get("name")), ("🏢 Firma", q.get("company")), ("📧 E-posta", q.get("email")), ("📞 Telefon", q.get("phone")),
            ("👕 Ürün", q.get("product_name") or "Genel teklif"), ("🔢 Adet", q.get("quantity") or "-"),
            ("🧵 Logo nakışı/baskı", "Evet" if q.get("embroidery") else "Hayır")]
    lines = [f"<b>🟠 {escape(company)} — Yeni Teklif Talebi</b>", ""]
    lines += [f"{k}: <b>{escape(str(v))}</b>" for k, v in rows if v]
    if q.get("message"):
        lines += ["", f"💬 {escape(q['message'][:1500])}"]
    return "\n".join(lines)
