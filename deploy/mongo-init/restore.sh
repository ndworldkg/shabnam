#!/bin/bash
# İlk açılışta (veritabanı boşken) mevcut ürün, kategori ve fotoğrafları otomatik yükler.
# MongoDB bu dosyayı yalnızca veri klasörü boşken bir kez çalıştırır.
set -e
ARCHIVE=/restore/shabnam.archive.gz
if [ -f "$ARCHIVE" ]; then
  echo "[shabnam] Başlangıç verileri yükleniyor -> ${DB_NAME}"
  mongorestore --archive="$ARCHIVE" --gzip --nsFrom="${SOURCE_DB}.*" --nsTo="${DB_NAME}.*"
  echo "[shabnam] Veriler yüklendi"
else
  echo "[shabnam] $ARCHIVE bulunamadı, boş veritabanı ile başlanıyor"
fi
