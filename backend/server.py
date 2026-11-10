import asyncio
import logging
import os
import re
import uuid
from contextlib import suppress
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, FastAPI, File, HTTPException, Request, Response, UploadFile
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from email_service import send_email, quote_email_html  # noqa: E402
from catalog_pdf import build_catalog  # noqa: E402
from translator import localize, PRODUCT_KEYS, CATEGORY_KEYS, SETTINGS_KEYS  # noqa: E402
from telegram_service import send_telegram, recent_chats, quote_telegram_text  # noqa: E402
from storage import save_file, read_file  # noqa: E402
from auth import build_auth  # noqa: E402

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

INDEXES = {
    "categories": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("slug", ASCENDING)], name="slug")],
    "products": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("category_id", ASCENDING)], name="cat"),
                 IndexModel([("created_at", DESCENDING)], name="created_desc")],
    "quotes": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("created_at", DESCENDING)], name="created_desc")],
    "messages": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("created_at", DESCENDING)], name="created_desc")],
    "users": [IndexModel([("email", ASCENDING)], name="email", unique=True), IndexModel([("id", ASCENDING)], name="uid")],
    "login_attempts": [IndexModel([("identifier", ASCENDING)], name="identifier")],
    "password_reset_tokens": [IndexModel([("expires_at", ASCENDING)], name="ttl", expireAfterSeconds=0),
                              IndexModel([("token_hash", ASCENDING)], name="token_hash")],
    "files": [IndexModel([("storage_path", ASCENDING)], name="path")],
    "meta": [IndexModel([("key", ASCENDING)], name="key", unique=True)],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


app = FastAPI()
api = APIRouter(prefix="/api")
auth_router, require_admin, seed_admin = build_auth(db, send_email)
api.include_router(auth_router)
APP_NAME = "shabnam-elegant"


# ---------- Helpers ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


TR_MAP = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.translate(TR_MAP).lower()).strip("-") or uuid.uuid4().hex[:6]


# ---------- Models ----------
class SpecField(BaseModel):
    key: str = Field(min_length=1)
    label: str = Field(min_length=1)


class CategoryIn(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    image: str = ""
    accent: str = "#F2962B"
    order: int = 0
    spec_fields: List[SpecField] = []
    default_sizes: List[str] = []
    i18n: dict = {}


def prep_category(body: CategoryIn) -> dict:
    data = body.model_dump()
    data["spec_labels"] = {f["key"]: f["label"] for f in data["spec_fields"]}
    return data


def prep_product(body) -> dict:
    data = body.model_dump()
    data["specs"] = {k: v.strip() for k, v in (data.get("specs") or {}).items() if isinstance(v, str) and v.strip()}
    return data


class ProductIn(BaseModel):
    name: str = Field(min_length=1)
    code: str = ""
    category_id: str
    summary: str = ""
    description: str = ""
    fabric: str = ""
    weight: str = ""
    features: List[str] = []
    sizes: List[str] = []
    colors: List[str] = []
    images: List[str] = []
    featured: bool = False
    active: bool = True
    price_from: Optional[float] = Field(default=None, ge=0)
    show_price: bool = False
    specs: dict = {}
    i18n: dict = {}


class QuoteIn(BaseModel):
    name: str = Field(min_length=2)
    company: str = ""
    email: str = Field(min_length=5)
    phone: str = Field(min_length=5)
    product_id: str = ""
    product_name: str = ""
    quantity: int = 0
    embroidery: bool = False
    message: str = ""


class MessageIn(BaseModel):
    name: str = Field(min_length=2)
    email: str = Field(min_length=5)
    phone: str = ""
    subject: str = ""
    message: str = Field(min_length=2)


class StatusIn(BaseModel):
    status: str


class SettingsIn(BaseModel):
    company_name: str = "Shabnam Elegant"
    tagline: str = ""
    about: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    whatsapp: str = ""
    working_hours: str = ""
    notification_email: str = ""
    telegram_chat_id: str = ""
    i18n: dict = {}


class ReorderIn(BaseModel):
    ids: List[str]


DEFAULT_SETTINGS = {
    "company_name": "Shabnam Elegant",
    "tagline": "İş elbisesi ve kurumsal üniforma üretimi",
    "about": "Shabnam Elegant; iş elbisesi, tulum, yelek ve kurumsal üniformaları kendi atölyesinde üretir. [Firma hakkında kısa metin — yönetim panelinden güncelleyin]",
    "phone": "[Telefon numarası]",
    "email": "[E-posta adresi]",
    "address": "[Fabrika / atölye adresi]",
    "whatsapp": "",
    "working_hours": "[Çalışma saatleri]",
    "notification_email": "",
    "telegram_chat_id": "",
}


# ---------- Files ----------
@api.post("/upload")
async def upload(request: Request, file: UploadFile = File(...)):
    user = await require_admin(request)
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Sadece görsel dosyaları yüklenebilir")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "Dosya 10MB'dan büyük olamaz")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4()}.{ext}"
    await asyncio.to_thread(save_file, path, data, file.content_type)
    await db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": path, "original_filename": file.filename,
                               "content_type": file.content_type, "size": len(data), "is_deleted": False,
                               "created_at": now_iso()})
    return {"url": f"/api/files/{path}"}


@api.get("/files/{path:path}")
async def get_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Dosya bulunamadı")
    try:
        data, ctype = await asyncio.to_thread(read_file, path)
    except FileNotFoundError:
        raise HTTPException(404, "Dosya bulunamadı")
    return Response(content=data, media_type=record.get("content_type") or ctype, headers={"Cache-Control": "public, max-age=31536000"})


# ---------- Settings ----------
@api.get("/settings")
async def get_settings():
    doc = await db.meta.find_one({"key": "settings"}, {"_id": 0, "key": 0}) or {}
    return {**DEFAULT_SETTINGS, **doc}


@api.put("/settings")
async def put_settings(body: SettingsIn, request: Request):
    await require_admin(request)
    data = body.model_dump()
    data["i18n"] = await localize(data, await get_settings(), SETTINGS_KEYS)
    await db.meta.update_one({"key": "settings"}, {"$set": data}, upsert=True)
    return await get_settings()


@api.get("/admin/telegram/chats")
async def telegram_chats(request: Request):
    await require_admin(request)
    if not os.environ.get("TELEGRAM_BOT_TOKEN"):
        raise HTTPException(400, "Telegram bot anahtarı henüz eklenmedi.")
    try:
        return await recent_chats()
    except Exception as e:
        raise HTTPException(400, f"Telegram: {e}")


class TelegramTestIn(BaseModel):
    chat_id: str = Field(min_length=1)


@api.post("/admin/telegram/test")
async def telegram_test(body: TelegramTestIn, request: Request):
    await require_admin(request)
    if not os.environ.get("TELEGRAM_BOT_TOKEN"):
        raise HTTPException(400, "Telegram bot anahtarı henüz eklenmedi.")
    settings = await get_settings()
    ok = await send_telegram(body.chat_id.strip(), f"✅ <b>{settings.get('company_name')}</b> — Telegram bildirimleri başarıyla bağlandı.")
    if not ok:
        raise HTTPException(400, "Mesaj gönderilemedi. Chat ID'yi ve botun bu sohbete ekli olduğunu kontrol edin.")
    return {"ok": True}


# ---------- Categories ----------
async def category_counts():
    pipeline = [{"$match": {"active": True}}, {"$group": {"_id": "$category_id", "n": {"$sum": 1}}}]
    return {d["_id"]: d["n"] async for d in db.products.aggregate(pipeline)}


@api.get("/categories")
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).to_list(200)
    counts = await category_counts()
    for c in cats:
        c["product_count"] = counts.get(c["id"], 0)
    return cats


@api.post("/categories")
async def create_category(body: CategoryIn, request: Request):
    await require_admin(request)
    data = prep_category(body)
    data["i18n"] = await localize(data, None, CATEGORY_KEYS)
    doc = {"id": str(uuid.uuid4()), "slug": slugify(body.name), "created_at": now_iso(), **data}
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/categories/{cid}")
async def update_category(cid: str, body: CategoryIn, request: Request):
    await require_admin(request)
    old = await db.categories.find_one({"id": cid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Kategori bulunamadı")
    data = prep_category(body)
    data["i18n"] = await localize(data, old, CATEGORY_KEYS)
    await db.categories.update_one({"id": cid}, {"$set": {**data, "slug": slugify(body.name)}})
    return await db.categories.find_one({"id": cid}, {"_id": 0})


@api.delete("/categories/{cid}")
async def delete_category(cid: str, request: Request):
    await require_admin(request)
    if await db.products.count_documents({"category_id": cid}):
        raise HTTPException(400, "Bu kategoride ürün var. Önce ürünleri taşıyın veya silin.")
    await db.categories.delete_one({"id": cid})
    return {"ok": True}


# ---------- Products ----------
async def attach_category(products: list) -> list:
    cats = {c["id"]: c async for c in db.categories.find({}, {"_id": 0})}
    for p in products:
        c = cats.get(p.get("category_id"), {})
        p["category"] = {"id": c.get("id", ""), "name": c.get("name", ""), "slug": c.get("slug", ""), "accent": c.get("accent", "#F2962B"),
                        "spec_fields": c.get("spec_fields", []), "spec_labels": c.get("spec_labels", {}), "i18n": c.get("i18n", {})}
    return products


@api.get("/products")
async def list_products(request: Request, category: Optional[str] = None, q: Optional[str] = None,
                        featured: Optional[bool] = None, all: bool = False):
    query = {}
    if all:
        await require_admin(request)
    else:
        query["active"] = True
    if category:
        cat = await db.categories.find_one({"$or": [{"slug": category}, {"id": category}]}, {"_id": 0})
        query["category_id"] = cat["id"] if cat else "__none__"
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"name": rx}, {"code": rx}, {"summary": rx}, {"i18n.ru.name": rx}, {"i18n.uz.name": rx}]
    if featured is not None:
        query["featured"] = featured
    items = await db.products.find(query, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(500)
    return await attach_category(items)


@api.post("/products/reorder")
async def reorder_products(body: ReorderIn, request: Request):
    await require_admin(request)
    for i, pid in enumerate(body.ids):
        await db.products.update_one({"id": pid}, {"$set": {"order": i}})
    return {"ok": True}


@api.post("/admin/translate-missing")
async def translate_missing(request: Request):
    await require_admin(request)
    n = 0
    for coll, keys in ((db.categories, CATEGORY_KEYS), (db.products, PRODUCT_KEYS)):
        async for d in coll.find({}, {"_id": 0}):
            i18n = await localize(d, d, keys)
            if i18n != d.get("i18n"):
                await coll.update_one({"id": d["id"]}, {"$set": {"i18n": i18n}})
                n += 1
    s = await get_settings()
    await db.meta.update_one({"key": "settings"}, {"$set": {"i18n": await localize(s, s, SETTINGS_KEYS)}}, upsert=True)
    return {"updated": n}


@api.get("/catalog.pdf")
async def catalog_pdf(lang: str = "ru"):
    lang = lang if lang in ("ru", "uz") else "ru"
    settings = await get_settings()
    cats = await db.categories.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).to_list(200)
    items = await attach_category(await db.products.find({"active": True}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(500))
    pdf = await asyncio.to_thread(build_catalog, settings, cats, items, lambda p: read_file(p)[0], lang)
    name = slugify(settings.get("company_name") or "catalog")
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="{name}-catalog-{lang}.pdf"'})


@api.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid, "active": True}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Ürün bulunamadı")
    return (await attach_category([p]))[0]


@api.post("/products")
async def create_product(body: ProductIn, request: Request):
    await require_admin(request)
    first = await db.products.find_one({}, {"_id": 0, "order": 1}, sort=[("order", 1)])
    data = prep_product(body)
    data["i18n"] = await localize(data, None, PRODUCT_KEYS)
    doc = {"id": str(uuid.uuid4()), "created_at": now_iso(), "updated_at": now_iso(), "order": (first or {}).get("order", 0) - 1,
           **data}
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/products/{pid}")
async def update_product(pid: str, body: ProductIn, request: Request):
    await require_admin(request)
    old = await db.products.find_one({"id": pid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Ürün bulunamadı")
    data = prep_product(body)
    data["i18n"] = await localize(data, old, PRODUCT_KEYS)
    await db.products.update_one({"id": pid}, {"$set": {**data, "updated_at": now_iso()}})
    return await db.products.find_one({"id": pid}, {"_id": 0})


@api.delete("/products/{pid}")
async def delete_product(pid: str, request: Request):
    await require_admin(request)
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ---------- Quotes & Messages ----------
QUOTE_HITS: dict = {}


async def notify_quote(doc: dict):
    settings = await get_settings()
    chat_id = (settings.get("telegram_chat_id") or "").strip()
    if chat_id and os.environ.get("TELEGRAM_BOT_TOKEN"):
        await send_telegram(chat_id, quote_telegram_text(doc, settings.get("company_name") or ""))
    to = (settings.get("notification_email") or "").strip() or os.environ["ADMIN_EMAIL"]
    if not to:
        return
    subject = f"Yeni teklif talebi: {doc['name']}" + (f" — {doc['product_name']}" if doc.get("product_name") else "")
    await send_email(to=to, subject=subject[:150], html=quote_email_html(doc), reply_to=doc["email"] if "@" in doc["email"] else None)


@api.post("/quotes")
async def create_quote(body: QuoteIn, request: Request, background: BackgroundTasks):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "").split(",")[0].strip()
    now = datetime.now(timezone.utc).timestamp()
    hits = [t for t in QUOTE_HITS.get(ip, []) if now - t < 600]
    if len(hits) >= 5:
        raise HTTPException(429, "Çok fazla talep gönderildi, lütfen biraz sonra tekrar deneyin.")
    QUOTE_HITS[ip] = hits + [now]
    doc = {"id": str(uuid.uuid4()), "status": "yeni", "created_at": now_iso(), **body.model_dump()}
    await db.quotes.insert_one(doc)
    doc.pop("_id", None)
    background.add_task(notify_quote, doc)
    return {"ok": True, "id": doc["id"]}


@api.get("/quotes")
async def list_quotes(request: Request):
    await require_admin(request)
    return await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.patch("/quotes/{qid}")
async def update_quote(qid: str, body: StatusIn, request: Request):
    await require_admin(request)
    await db.quotes.update_one({"id": qid}, {"$set": {"status": body.status}})
    return {"ok": True}


@api.delete("/quotes/{qid}")
async def delete_quote(qid: str, request: Request):
    await require_admin(request)
    await db.quotes.delete_one({"id": qid})
    return {"ok": True}


@api.post("/messages")
async def create_message(body: MessageIn):
    doc = {"id": str(uuid.uuid4()), "read": False, "created_at": now_iso(), **body.model_dump()}
    await db.messages.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api.get("/messages")
async def list_messages(request: Request):
    await require_admin(request)
    return await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.patch("/messages/{mid}")
async def read_message(mid: str, request: Request):
    await require_admin(request)
    await db.messages.update_one({"id": mid}, {"$set": {"read": True}})
    return {"ok": True}


@api.delete("/messages/{mid}")
async def delete_message(mid: str, request: Request):
    await require_admin(request)
    await db.messages.delete_one({"id": mid})
    return {"ok": True}


@api.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    return {
        "products": await db.products.count_documents({}),
        "categories": await db.categories.count_documents({}),
        "new_quotes": await db.quotes.count_documents({"status": "yeni"}),
        "unread_messages": await db.messages.count_documents({"read": False}),
    }


# ---------- Seed ----------
U = "https://images.unsplash.com/"
Q = "?crop=entropy&cs=srgb&fm=jpg&q=80&w=1400"
SEED_CATS = [
    ("Yüksek Görünürlük", "Reflektörlü mont, ceket ve yelekler", U + "photo-1681812508281-7589b75b2e46" + Q, "#F2962B"),
    ("İş Tulumları & Takımlar", "Fabrika, atölye ve saha için dayanıklı takımlar", U + "photo-1735494032948-14ef288fc9d3" + Q, "#3B82F6"),
    ("İş Yelekleri", "Çok cepli, hafif ve görünür yelekler", U + "photo-1662309376159-b95fb193d96b" + Q, "#FACC15"),
    ("Mutfak & Servis", "Aşçı ceketi, önlük ve servis üniformaları", U + "photo-1792950067048-3cae5982a423" + Q, "#10B981"),
    ("Medikal Üniformalar", "Hastane ve klinikler için forma takımları", U + "photo-1594824476967-48c8b964273f" + Q, "#EC4899"),
]
SEED_PRODUCTS = [
    (0, "Reflektörlü Saha Ceketi", "SE-101", "photo-1681812508281-7589b75b2e46", True),
    (0, "Reflektörlü Kışlık Parka", "SE-102", "photo-1783410029012-a77854c6c27d", False),
    (1, "Operatör İş Takımı", "SE-201", "photo-1735494032948-14ef288fc9d3", True),
    (1, "Kurumsal İş Ceketi", "SE-202", "photo-1759692072000-e9c6edf6200f", False),
    (2, "Çok Cepli Saha Yeleği", "SE-301", "photo-1622612023350-b15f063eabe6", True),
    (2, "Fosforlu Ekip Yeleği", "SE-302", "photo-1652303518379-c0ef1c9fb2b1", False),
    (3, "Klasik Aşçı Ceketi", "SE-401", "photo-1792950067048-3cae5982a423", True),
    (4, "Medikal Forma Takımı", "SE-501", "photo-1594824476967-48c8b964273f", True),
]


GARMENT_SPECS = [{"key": "fabric", "label": "Kumaş"}, {"key": "weight", "label": "Gramaj"}]
GARMENT_I18N = {"ru": {"fabric": "Ткань", "weight": "Плотность"}, "uz": {"fabric": "Mato", "weight": "Zichlik"}}


async def migrate_specs():
    async for c in db.categories.find({"spec_fields": {"$exists": False}}, {"_id": 0}):
        i18n = c.get("i18n") or {}
        for lang in ("ru", "uz"):
            i18n.setdefault(lang, {})["spec_labels"] = GARMENT_I18N[lang]
        await db.categories.update_one({"id": c["id"]}, {"$set": {
            "spec_fields": GARMENT_SPECS, "spec_labels": {f["key"]: f["label"] for f in GARMENT_SPECS},
            "default_sizes": ["S", "M", "L", "XL", "XXL"], "i18n": i18n}})
    async for p in db.products.find({"specs": {"$exists": False}}, {"_id": 0}):
        specs = {k: p[k] for k in ("fabric", "weight") if p.get(k)}
        i18n = p.get("i18n") or {}
        for lang in ("ru", "uz"):
            tr = i18n.get(lang) or {}
            tr_specs = {k: tr[k] for k in ("fabric", "weight") if tr.get(k)}
            if tr_specs:
                i18n.setdefault(lang, {})["specs"] = tr_specs
        await db.products.update_one({"id": p["id"]}, {"$set": {"specs": specs, "i18n": i18n}})


async def migrate_order():
    missing = await db.products.find({"order": {"$exists": False}}, {"_id": 0, "id": 1}).sort("created_at", -1).to_list(1000)
    for i, p in enumerate(missing):
        await db.products.update_one({"id": p["id"]}, {"$set": {"order": i}})


async def seed():
    if await db.categories.count_documents({}):
        return
    cat_ids = []
    for i, (name, desc, img, accent) in enumerate(SEED_CATS):
        cid = str(uuid.uuid4())
        cat_ids.append(cid)
        await db.categories.insert_one({"id": cid, "slug": slugify(name), "name": name, "description": desc, "image": img,
                                        "accent": accent, "order": i, "created_at": now_iso()})
    for ci, name, code, photo, featured in SEED_PRODUCTS:
        await db.products.insert_one({
            "id": str(uuid.uuid4()), "name": name, "code": code, "category_id": cat_ids[ci],
            "summary": "Örnek ürün — bilgileri yönetim panelinden güncelleyin.",
            "description": "Bu bir örnek üründür. Kumaş, gramaj, beden ve renk bilgilerini yönetim panelinden kendi ürününüze göre düzenleyin.",
            "fabric": "[Kumaş bilgisi]", "weight": "[Gramaj]", "features": ["[Özellik 1]", "[Özellik 2]", "[Özellik 3]"],
            "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["[Renk]"], "images": [U + photo + Q],
            "featured": featured, "active": True, "created_at": now_iso(), "updated_at": now_iso()})


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await seed()
    await migrate_order()
    await migrate_specs()
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
