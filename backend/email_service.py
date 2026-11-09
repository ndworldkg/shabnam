import logging
import os
import re
import ipaddress
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send", headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            body = e.response.json()
        except ValueError:
            body = {}
        if body.get("code") in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning(f"Email paused: {body.get('code')} ({e.response.status_code}): {body.get('message', '')}")
        else:
            logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
    except Exception as e:
        logger.error(f"Email send error: {e}")
    return None


def quote_email_html(q: dict) -> str:
    rows = [("Ad Soyad", q.get("name")), ("Firma", q.get("company")), ("E-posta", q.get("email")), ("Telefon", q.get("phone")),
            ("Ürün", q.get("product_name") or "Genel teklif"), ("Adet", q.get("quantity") or "-"),
            ("Logo nakışı / baskı", "Evet" if q.get("embroidery") else "Hayır")]
    trs = "".join(
        f'<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #eee;width:160px">{escape(k)}</td>'
        f'<td style="padding:8px 12px;color:#0B0F17;font-size:14px;border-bottom:1px solid #eee">{escape(str(v or "-"))}</td></tr>'
        for k, v in rows)
    msg = escape(q.get("message") or "").replace("\n", "<br>")
    return (
        '<table role="presentation" width="100%" style="background:#f4f4f5;padding:24px 0"><tr><td align="center">'
        '<table role="presentation" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif">'
        f'<tr><td style="background:#0B0F17;padding:24px;color:#ffffff;font-size:20px;font-weight:bold">'
        f'{escape(EMAIL_FROM_NAME)} <span style="color:#F2962B">· Yeni Teklif Talebi</span></td></tr>'
        '<tr><td style="height:6px;background:#FACC15"></td></tr>'
        f'<tr><td style="padding:24px"><table role="presentation" width="100%" style="border-collapse:collapse">{trs}</table>'
        + (f'<p style="margin:20px 0 6px;color:#64748b;font-size:13px">Mesaj</p><p style="margin:0;color:#0B0F17;font-size:14px;line-height:1.6">{msg}</p>' if msg else "")
        + '<p style="margin-top:24px;color:#64748b;font-size:13px">Tüm talepleri yönetim panelindeki "Teklifler" bölümünden görebilirsiniz.</p></td></tr>'
        f'<tr><td style="padding:16px 24px;background:#fafafa;color:#94a3b8;font-size:12px">Bu e-posta {escape(EMAIL_FROM_NAME)} web sitesi tarafından otomatik gönderilmiştir.</td></tr>'
        '</table></td></tr></table>')
