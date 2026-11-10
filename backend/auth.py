import hashlib
import os
import secrets
import time
import uuid
from datetime import datetime, timedelta, timezone
from html import escape

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

JWT_ALGORITHM = "HS256"
ACCESS_MIN = 60 * 12
REFRESH_DAYS = 14
MAX_ATTEMPTS = 5
LOCK_MINUTES = 15


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except ValueError:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def _token(user_id: str, kind: str, delta: timedelta) -> str:
    return jwt.encode({"sub": user_id, "type": kind, "exp": datetime.now(timezone.utc) + delta}, _secret(), algorithm=JWT_ALGORITHM)


def _cookie_secure() -> bool:
    return os.environ.get("COOKIE_SECURE", "true").lower() != "false"


def _set_cookies(response: Response, user_id: str):
    opts = dict(httponly=True, secure=_cookie_secure(), samesite="lax", path="/")
    response.set_cookie("access_token", _token(user_id, "access", timedelta(minutes=ACCESS_MIN)), max_age=ACCESS_MIN * 60, **opts)
    response.set_cookie("refresh_token", _token(user_id, "refresh", timedelta(days=REFRESH_DAYS)), max_age=REFRESH_DAYS * 86400, **opts)


def public_user(u: dict) -> dict:
    return {"id": u["id"], "email": u["email"], "name": u.get("name", ""), "role": u.get("role", "admin")}


class LoginIn(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


class PasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class ForgotIn(BaseModel):
    email: str = Field(min_length=3)


class ResetIn(BaseModel):
    token: str = Field(min_length=20)
    new_password: str = Field(min_length=8)


_FORGOT_HITS: dict = {}


def _hash_token(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


def _reset_html(link: str, company: str) -> str:
    return (
        '<table role="presentation" width="100%" style="background:#f4f4f5;padding:24px 0"><tr><td align="center">'
        '<table role="presentation" width="560" style="background:#ffffff;border-radius:12px;font-family:Arial,sans-serif">'
        f'<tr><td style="background:#0B0F17;padding:22px;color:#F2962B;font-size:18px;font-weight:bold">{escape(company)}</td></tr>'
        '<tr><td style="padding:28px;color:#0B0F17;font-size:15px;line-height:1.6">'
        '<p style="margin:0 0 12px">Yönetim paneli için şifre sıfırlama talebi aldık.</p>'
        '<p style="margin:0 0 24px">Yeni şifre belirlemek için aşağıdaki butona tıklayın. Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir.</p>'
        f'<p style="margin:0 0 24px"><a href="{escape(link)}" style="background:#F2962B;color:#0B0F17;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Şifremi sıfırla</a></p>'
        '<p style="margin:0;color:#64748b;font-size:13px">Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.</p>'
        '</td></tr></table></td></tr></table>')


def build_auth(db, send_email=None):
    router = APIRouter(prefix="/auth")

    async def require_admin(request: Request) -> dict:
        token = request.cookies.get("access_token")
        auth = request.headers.get("Authorization", "")
        if not token and auth.startswith("Bearer "):
            token = auth[7:]
        if not token:
            raise HTTPException(401, "Giriş gerekli")
        try:
            payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Oturum süresi doldu")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Geçersiz oturum")
        if payload.get("type") != "access":
            raise HTTPException(401, "Geçersiz oturum")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(403, "Yetkiniz yok")
        return public_user(user)

    @router.post("/login")
    async def login(body: LoginIn, request: Request, response: Response):
        email = body.email.strip().lower()
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "").split(",")[0].strip()
        ident = f"{ip}:{email}"
        rec = await db.login_attempts.find_one({"identifier": ident}, {"_id": 0})
        now = datetime.now(timezone.utc)
        if rec and rec.get("locked_until") and datetime.fromisoformat(rec["locked_until"]) > now:
            raise HTTPException(429, "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.")
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
            count = (rec or {}).get("count", 0) + 1
            update = {"identifier": ident, "count": count, "updated_at": now.isoformat()}
            if count >= MAX_ATTEMPTS:
                update.update(count=0, locked_until=(now + timedelta(minutes=LOCK_MINUTES)).isoformat())
            await db.login_attempts.update_one({"identifier": ident}, {"$set": update}, upsert=True)
            raise HTTPException(401, "E-posta veya şifre hatalı")
        await db.login_attempts.delete_one({"identifier": ident})
        _set_cookies(response, user["id"])
        return public_user(user)

    @router.post("/refresh")
    async def refresh(request: Request, response: Response):
        token = request.cookies.get("refresh_token")
        if not token:
            raise HTTPException(401, "Giriş gerekli")
        try:
            payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Geçersiz oturum")
        if payload.get("type") != "refresh" or not await db.users.find_one({"id": payload["sub"]}):
            raise HTTPException(401, "Geçersiz oturum")
        _set_cookies(response, payload["sub"])
        return {"ok": True}

    @router.get("/me")
    async def me(request: Request):
        return await require_admin(request)

    @router.post("/logout")
    async def logout(response: Response):
        for name in ("access_token", "refresh_token"):
            response.delete_cookie(name, path="/", secure=_cookie_secure(), samesite="lax")
        return {"ok": True}

    @router.post("/change-password")
    async def change_password(body: PasswordIn, request: Request):
        user = await require_admin(request)
        full = await db.users.find_one({"id": user["id"]}, {"_id": 0})
        if not verify_password(body.current_password, full.get("password_hash", "")):
            raise HTTPException(400, "Mevcut şifre hatalı")
        await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
        return {"ok": True}

    @router.post("/forgot-password")
    async def forgot_password(body: ForgotIn, request: Request):
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "").split(",")[0].strip()
        now = time.time()
        hits = [t for t in _FORGOT_HITS.get(ip, []) if now - t < 900]
        if len(hits) >= 3:
            raise HTTPException(429, "Çok fazla deneme. 15 dakika sonra tekrar deneyin.")
        _FORGOT_HITS[ip] = hits + [now]
        user = await db.users.find_one({"email": body.email.strip().lower(), "role": "admin"}, {"_id": 0})
        if user and send_email:
            token = secrets.token_urlsafe(32)
            await db.password_reset_tokens.insert_one({
                "token_hash": _hash_token(token), "user_id": user["id"], "used": False,
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=1), "created_at": datetime.now(timezone.utc)})
            link = f"{os.environ['PUBLIC_SITE_URL'].rstrip('/')}/admin/sifre-sifirla?token={token}"
            settings = await db.meta.find_one({"key": "settings"}, {"_id": 0}) or {}
            company = settings.get("company_name") or "Shabnam Elegant"
            await send_email(to=user["email"], subject=f"{company} — Şifre sıfırlama", html=_reset_html(link, company))
        return {"ok": True}

    @router.post("/reset-password")
    async def reset_password(body: ResetIn):
        rec = await db.password_reset_tokens.find_one({"token_hash": _hash_token(body.token)}, {"_id": 0})
        exp = rec.get("expires_at") if rec else None
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if not rec or rec.get("used") or not exp or exp < datetime.now(timezone.utc):
            raise HTTPException(400, "Bağlantı geçersiz veya süresi dolmuş. Yeniden şifre sıfırlama isteği gönderin.")
        await db.password_reset_tokens.update_many({"user_id": rec["user_id"], "used": False}, {"$set": {"used": True}})
        await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
        return {"ok": True}

    async def seed_admin():
        email = os.environ["ADMIN_EMAIL"].strip().lower()
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing and existing.get("password_hash"):
            return
        fields = {"password_hash": hash_password(os.environ["ADMIN_PASSWORD"]), "role": "admin"}
        if existing:
            await db.users.update_one({"email": email}, {"$set": {**fields, "id": existing.get("id") or str(uuid.uuid4())}})
        else:
            await db.users.insert_one({"id": str(uuid.uuid4()), "email": email, "name": "Admin",
                                       "created_at": datetime.now(timezone.utc).isoformat(), **fields})

    return router, require_admin, seed_admin
