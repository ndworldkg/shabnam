"""Run inside the Emergent preview to export all data (incl. uploaded images) for the VPS.
Usage: cd /app/backend && python ../deploy/export_data.py"""
import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")
os.environ.pop("STORAGE_BACKEND", None)

import gridfs  # noqa: E402
from pymongo import MongoClient  # noqa: E402

import sys  # noqa: E402
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from storage import read_file  # noqa: E402

db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
fs = gridfs.GridFS(db)
for f in db.files.find({"is_deleted": False}):
    if fs.exists({"filename": f["storage_path"]}):
        continue
    data, ctype = read_file(f["storage_path"])
    fs.put(data, filename=f["storage_path"], contentType=f.get("content_type") or ctype)
    print("copied", f["storage_path"])

out = Path(__file__).parent / "data" / "shabnam.archive.gz"
out.parent.mkdir(exist_ok=True)
subprocess.run(["mongodump", f"--uri={os.environ['MONGO_URL']}", f"--db={os.environ['DB_NAME']}",
                "--excludeCollection=login_attempts", "--excludeCollection=user_sessions",
                f"--archive={out}", "--gzip"], check=True)
print("export ->", out)
