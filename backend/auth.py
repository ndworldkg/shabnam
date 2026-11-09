import os
import uuid
from datetime import datetime, timedelta, timezone

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


def build_auth(db):
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
