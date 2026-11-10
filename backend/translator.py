import json
import logging
import os
import re
import uuid



logger = logging.getLogger(__name__)
LANGS = ("ru", "uz")
PRODUCT_KEYS = ("name", "summary", "description", "specs", "features", "colors")
CATEGORY_KEYS = ("name", "description", "spec_labels")
SETTINGS_KEYS = ("tagline", "about", "address", "working_hours")

SYSTEM = (
    "You are a professional translator for a workwear (iş elbisesi) manufacturer's product catalog. "
    "Translate the Turkish values of the given JSON object into Russian (ru) and Uzbek in Latin script (uz). "
    "Keep the same keys; lists stay lists of the same length; nested objects keep their inner keys unchanged (translate only values). "
    "Keep product codes, sizes, numbers, units and brand names unchanged. "
    "If a value is a placeholder in square brackets, translate the text inside and keep the brackets. "
    'Reply with ONLY a JSON object: {"ru": {...}, "uz": {...}}.'
)


async def _ask(text: str) -> str:
    if os.environ.get("ANTHROPIC_API_KEY"):
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        msg = await client.messages.create(model=os.environ["ANTHROPIC_MODEL"], max_tokens=4000, system=SYSTEM,
                                           messages=[{"role": "user", "content": text}])
        return "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    if os.environ.get("EMERGENT_LLM_KEY"):
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"tr-{uuid.uuid4().hex}", system_message=SYSTEM) \
            .with_model("anthropic", "claude-sonnet-5-5")
        raw = await chat.send_message(UserMessage(text=text))
        return raw if isinstance(raw, str) else str(raw)
    raise RuntimeError("No translation provider configured (ANTHROPIC_API_KEY)")


async def translate(fields: dict) -> dict:
    text = await _ask(json.dumps(fields, ensure_ascii=False))
    match = re.search(r"\{.*\}", text, re.S)
    return json.loads(match.group(0)) if match else {}


def _flat(obj: dict, keys) -> dict:
    out = {}
    for k in keys:
        v = (obj or {}).get(k)
        if isinstance(v, dict):
            out.update({f"{k}.{sk}": sv for sk, sv in v.items()})
        elif k in (obj or {}):
            out[k] = v
    return out


def _unflat(flat: dict) -> dict:
    out = {}
    for k, v in flat.items():
        if "." in k:
            p, s = k.split(".", 1)
            out.setdefault(p, {})[s] = v
        else:
            out[k] = v
    return out


async def localize(new: dict, old: dict | None, keys) -> dict:
    """Return i18n dict for `new`; keeps manual edits, re-translates changed/missing fields (dict values per sub-key)."""
    given = new.get("i18n") or {}
    old_i18n = (old or {}).get("i18n") or {}
    new_f = _flat(new, keys)
    old_f = _flat(old, keys) if old is not None else None
    i18n = {lang: _flat(given.get(lang) or {}, keys) for lang in LANGS}
    old_tr = {lang: _flat(old_i18n.get(lang) or {}, keys) for lang in LANGS}
    extra = {lang: {k: v for k, v in (given.get(lang) or {}).items() if k not in keys} for lang in LANGS}
    for lang in LANGS:
        for k in list(i18n[lang]):
            if not new_f.get(k):
                i18n[lang].pop(k)
    if old_f is not None:
        for k, v in new_f.items():
            if v != old_f.get(k):
                for lang in LANGS:
                    if i18n[lang].get(k) == old_tr[lang].get(k):
                        i18n[lang].pop(k, None)
    missing = {k: v for k, v in new_f.items() if v and any(not i18n[lang].get(k) for lang in LANGS)}
    if missing:
        try:
            result = await translate(_unflat(missing))
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            result = {}
        for lang in LANGS:
            for k, v in _flat(result.get(lang) or {}, {k.split(".")[0] for k in missing}).items():
                if k in missing and not i18n[lang].get(k) and v:
                    i18n[lang][k] = v
    return {lang: {**extra[lang], **_unflat(i18n[lang])} for lang in LANGS}
