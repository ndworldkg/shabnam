import json
import logging
import os
import re
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)
LANGS = ("ru", "uz")
PRODUCT_KEYS = ("name", "summary", "description", "fabric", "weight", "features", "colors")
CATEGORY_KEYS = ("name", "description")
SETTINGS_KEYS = ("tagline", "about", "address", "working_hours")

SYSTEM = (
    "You are a professional translator for a workwear (iş elbisesi) manufacturer's product catalog. "
    "Translate the Turkish values of the given JSON object into Russian (ru) and Uzbek in Latin script (uz). "
    "Keep the same keys; lists stay lists of the same length. Keep product codes, sizes, numbers, units and brand names unchanged. "
    "If a value is a placeholder in square brackets, translate the text inside and keep the brackets. "
    'Reply with ONLY a JSON object: {"ru": {...}, "uz": {...}}.'
)


async def translate(fields: dict) -> dict:
    chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"tr-{uuid.uuid4().hex}", system_message=SYSTEM) \
        .with_model("anthropic", "claude-sonnet-5-5")
    raw = await chat.send_message(UserMessage(text=json.dumps(fields, ensure_ascii=False)))
    text = raw if isinstance(raw, str) else str(raw)
    match = re.search(r"\{.*\}", text, re.S)
    return json.loads(match.group(0)) if match else {}


async def localize(new: dict, old: dict | None, keys) -> dict:
    """Return i18n dict for `new`; keeps manual edits, re-translates changed/missing fields."""
    given = new.get("i18n") or {}
    i18n = {lang: dict(given.get(lang) or {}) for lang in LANGS}
    old_i18n = (old or {}).get("i18n") or {}
    for k in keys:
        if not new.get(k):
            for lang in LANGS:
                i18n[lang].pop(k, None)
            continue
        if old is not None and new.get(k) != old.get(k):
            for lang in LANGS:
                if i18n[lang].get(k) == (old_i18n.get(lang) or {}).get(k):
                    i18n[lang].pop(k, None)
    missing = {k: new[k] for k in keys if new.get(k) and any(not i18n[lang].get(k) for lang in LANGS)}
    if missing:
        try:
            result = await translate(missing)
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            result = {}
        for lang in LANGS:
            for k, v in (result.get(lang) or {}).items():
                if k in missing and not i18n[lang].get(k) and v:
                    i18n[lang][k] = v
    return i18n
