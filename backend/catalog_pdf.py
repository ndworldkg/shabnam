import io
import logging
from pathlib import Path

import requests
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)
FONT_DIR = Path(__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("Sans", str(FONT_DIR / "LiberationSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Bold", str(FONT_DIR / "LiberationSans-Bold.ttf")))

DARK, ORANGE, YELLOW, GREY, LIGHT = HexColor("#0B0F17"), HexColor("#FF5722"), HexColor("#FACC15"), HexColor("#64748B"), HexColor("#F4F4F5")
W, H = A4
M = 40

L = {
    "ru": {"title1": "КАТАЛОГ", "title2": "ПРОДУКЦИИ", "count": "товаров", "code": "Код",
           "fabric": "Ткань", "weight": "Плотность", "sizes": "Размеры", "colors": "Цвета", "features": "Особенности"},
    "uz": {"title1": "MAHSULOTLAR", "title2": "KATALOGI", "count": "ta mahsulot", "code": "Kod",
           "fabric": "Mato", "weight": "Zichlik", "sizes": "O'lchamlar", "colors": "Ranglar", "features": "Xususiyatlar"},
}


def _loc(obj, key, lang):
    return ((obj.get("i18n") or {}).get(lang) or {}).get(key) or obj.get(key)


def _logo(c, x, y, s):
    c.setFillColor(DARK)
    c.roundRect(x, y, s, s, s * 0.23, fill=1, stroke=0)
    k = s / 48
    p = c.beginPath()
    for i, (px, py) in enumerate([(9, 11), (18, 11), (24, 18), (30, 11), (39, 11), (24, 28)]):
        (p.moveTo if i == 0 else p.lineTo)(x + px * k, y + s - py * k)
    p.close()
    c.setFillColor(ORANGE)
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(YELLOW)
    c.rect(x + 9 * k, y + s - 36 * k, 30 * k, 5 * k, fill=1, stroke=0)


def _image(url, fetch_storage):
    try:
        if url.startswith("/api/files/"):
            data = fetch_storage(url[len("/api/files/"):])
        else:
            data = requests.get(url, timeout=20).content
        return ImageReader(io.BytesIO(data))
    except Exception as e:
        logger.warning(f"PDF image skipped {url}: {e}")
        return None


def _draw_cover_image(c, ir, x, y, w, h):
    iw, ih = ir.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, 8)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(ir, x - (dw - w) / 2, y - (dh - h) / 2, dw, dh)
    c.restoreState()


def _footer(c, settings, page, lang):
    c.setFillColor(DARK)
    c.rect(0, 0, W, 34, fill=1, stroke=0)
    c.setFillColor(YELLOW)
    c.rect(0, 34, W, 3, fill=1, stroke=0)
    c.setFont("Sans", 8.5)
    c.setFillColor(HexColor("#CBD5E1"))
    info = "  ·  ".join(v for v in [settings.get("phone"), settings.get("email"), _loc(settings, "address", lang)] if v)
    c.drawString(M, 13, info[:130])
    c.drawRightString(W - M, 13, str(page))


def _cover(c, settings, count, lang):
    t = L[lang]
    c.setFillColor(DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    _logo(c, M, H - M - 56, 56)
    c.setFillColor(ORANGE)
    c.rect(0, 250, W, 26, fill=1, stroke=0)
    c.setFillColor(YELLOW)
    c.rect(0, 232, W, 7, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Sans-Bold", 44)
    c.drawString(M, H / 2 + 70, t["title1"])
    c.setFillColor(ORANGE)
    c.drawString(M, H / 2 + 20, t["title2"])
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Sans-Bold", 20)
    c.drawString(M, H / 2 - 30, settings.get("company_name") or "Shabnam Elegant")
    c.setFont("Sans", 12)
    c.setFillColor(HexColor("#CBD5E1"))
    c.drawString(M, H / 2 - 52, _loc(settings, "tagline", lang) or "")
    c.drawString(M, 120, f"{count} {t['count']}")
    info = [v for v in [settings.get("phone"), settings.get("email"), _loc(settings, "address", lang)] if v]
    for i, v in enumerate(info):
        c.drawString(M, 96 - i * 16, v[:90])
    c.showPage()


def _product(c, p, y, fetch_storage, lang):
    t = L[lang]
    lo = lambda k: _loc(p, k, lang)  # noqa: E731
    box_h = 230
    c.setFillColor(LIGHT)
    c.roundRect(M, y - box_h, W - 2 * M, box_h, 10, fill=1, stroke=0)
    img_w = 170
    ir = _image(p["images"][0], fetch_storage) if p.get("images") else None
    if ir:
        _draw_cover_image(c, ir, M + 10, y - box_h + 10, img_w, box_h - 20)
    tx = M + img_w + 30
    tw = W - M - tx - 14
    accent = HexColor(p.get("category", {}).get("accent") or "#FF5722")
    c.setFillColor(accent)
    c.setFont("Sans-Bold", 8)
    c.drawString(tx, y - 28, (_loc(p.get("category", {}), "name", lang) or "").upper())
    c.setFillColor(DARK)
    c.setFont("Sans-Bold", 17)
    ty = y - 48
    for line in simpleSplit(lo("name"), "Sans-Bold", 17, tw)[:2]:
        c.drawString(tx, ty, line)
        ty -= 20
    if p.get("code"):
        c.setFont("Sans", 9)
        c.setFillColor(GREY)
        c.drawString(tx, ty, f"{t['code']}: {p['code']}")
        ty -= 18
    c.setFont("Sans", 9.5)
    c.setFillColor(HexColor("#334155"))
    for line in simpleSplit(lo("summary") or "", "Sans", 9.5, tw)[:3]:
        c.drawString(tx, ty, line)
        ty -= 13
    ty -= 6
    specs = [(t["fabric"], lo("fabric")), (t["weight"], lo("weight")), (t["sizes"], " · ".join(p.get("sizes") or [])),
             (t["colors"], " · ".join(lo("colors") or [])), (t["features"], " · ".join(lo("features") or []))]
    for k, v in specs:
        if not v or ty < y - box_h + 16:
            continue
        c.setFont("Sans-Bold", 8.5)
        c.setFillColor(GREY)
        c.drawString(tx, ty, k.upper())
        c.setFont("Sans", 9)
        c.setFillColor(DARK)
        c.drawString(tx + 76, ty, simpleSplit(v, "Sans", 9, tw - 76)[0])
        ty -= 14


def build_catalog(settings: dict, categories: list, products: list, fetch_storage, lang: str = "ru") -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    c.setTitle(f"{settings.get('company_name', '')} — {L[lang]['title1']} {L[lang]['title2']}")
    _cover(c, settings, len(products), lang)
    page = 2
    for cat in categories:
        items = [p for p in products if p.get("category_id") == cat["id"]]
        if not items:
            continue
        for i in range(0, len(items), 3):
            c.setFillColor(HexColor(cat.get("accent") or "#FF5722"))
            c.rect(M, H - M - 6, 40, 6, fill=1, stroke=0)
            c.setFillColor(DARK)
            c.setFont("Sans-Bold", 22)
            c.drawString(M, H - M - 34, _loc(cat, "name", lang).upper())
            y = H - M - 56
            for p in items[i:i + 3]:
                _product(c, p, y, fetch_storage, lang)
                y -= 245
            _footer(c, settings, page, lang)
            c.showPage()
            page += 1
    c.save()
    return buf.getvalue()
