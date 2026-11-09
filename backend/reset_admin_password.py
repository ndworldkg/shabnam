"""Reset admin password: python reset_admin_password.py NEW_PASSWORD"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

from auth import hash_password

load_dotenv(Path(__file__).parent / ".env")
if len(sys.argv) != 2 or len(sys.argv[1]) < 8:
    sys.exit("Kullanım: python reset_admin_password.py YENI_SIFRE (en az 8 karakter)")
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
res = db.users.update_one({"email": os.environ["ADMIN_EMAIL"].strip().lower()}, {"$set": {"password_hash": hash_password(sys.argv[1])}})
print("Şifre güncellendi" if res.matched_count else "Yönetici bulunamadı (ADMIN_EMAIL kontrol edin)")
