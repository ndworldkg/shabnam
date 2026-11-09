"""Image storage: Emergent object storage by default; MongoDB GridFS when STORAGE_BACKEND=mongo (self-hosted VPS)."""
import os

import gridfs
import requests
from pymongo import MongoClient

STORAGE_URL = ((os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com").rstrip("/") \
    + "/objstore/api/v1/storage"
_key = None
_fs = None


def _use_mongo() -> bool:
    return os.environ.get("STORAGE_BACKEND", "").strip().lower() == "mongo"


def _gridfs():
    global _fs
    if _fs is None:
        _fs = gridfs.GridFS(MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]])
    return _fs


def _emergent_key(force: bool = False) -> str:
    global _key
    if _key and not force:
        return _key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    resp.raise_for_status()
    _key = resp.json()["storage_key"]
    return _key


def save_file(path: str, data: bytes, content_type: str) -> None:
    if _use_mongo():
        _gridfs().put(data, filename=path, contentType=content_type)
        return
    url = f"{STORAGE_URL}/objects/{path}"
    resp = requests.put(url, headers={"X-Storage-Key": _emergent_key(), "Content-Type": content_type}, data=data, timeout=120)
    if resp.status_code == 404:
        resp = requests.put(url, headers={"X-Storage-Key": _emergent_key(True), "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()


def read_file(path: str) -> tuple[bytes, str]:
    if _use_mongo():
        f = _gridfs().find_one({"filename": path}, sort=[("uploadDate", -1)])
        if not f:
            raise FileNotFoundError(path)
        return f.read(), f.content_type or "application/octet-stream"
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": _emergent_key()}, timeout=60)
    if resp.status_code == 404:
        raise FileNotFoundError(path)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
