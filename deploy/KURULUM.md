# Shabnam Elegant — Kendi VPS Sunucunuza Kurulum

Gereken: Ubuntu 22.04/24.04 bir VPS (en az 2 GB RAM), bir alan adı.

## 1. Alan adını yönlendirin
Alan adı panelinizde **A kaydı** oluşturun: `ornek-site.com` → VPS IP adresiniz (isterseniz `www` için de).

## 2. Sunucuya Docker kurun
```bash
curl -fsSL https://get.docker.com | sh
```

## 3. Kodu sunucuya alın
Emergent'te "Save to GitHub" ile kodu GitHub'a gönderin, sonra sunucuda:
```bash
git clone https://github.com/KULLANICI/REPO.git shabnam && cd shabnam/deploy
cp env.example .env
nano .env        # alan adı, şifre, SMTP, anahtarlar
```
`JWT_SECRET` için: `openssl rand -hex 32`

## 4. Başlatın
```bash
docker compose up -d --build
```
HTTPS sertifikası otomatik alınır (Caddy). Birkaç dakika sonra `https://ornek-site.com` açılır.

## 5. Mevcut verileri (ürünler, kategoriler, fotoğraflar) aktarın
`deploy/data/shabnam.archive.gz` dosyası, Emergent'teki verilerinizin yedeğidir:
```bash
docker compose exec mongo mongorestore --archive=/restore/shabnam.archive.gz --gzip \
  --nsFrom='test_database.*' --nsTo="shabnam.*" --drop
docker compose restart backend
```
(`shabnam` yerine `.env` içindeki `DB_NAME` değerini yazın.)

## 6. Yönetim paneli
`https://ornek-site.com/admin` → `.env`'deki `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile giriş yapın.
Yedekten veri aktardıysanız, yedekteki yöneticinin şifresi geçerlidir. Panelde
Firma Bilgileri → **Şifre değiştir** ile değiştirin.

Şifreyi unutursanız:
```bash
docker compose exec backend python reset_admin_password.py yeni-sifre
```

## Güncelleme
```bash
git pull && docker compose up -d --build
```

## Yedek alma
```bash
docker compose exec mongo mongodump --db=shabnam --archive=/data/db/yedek.gz --gzip
docker compose cp mongo:/data/db/yedek.gz ./yedek-$(date +%F).gz
```

## Notlar
- **Gmail SMTP:** Google hesabında 2 adımlı doğrulamayı açın → "Uygulama şifreleri" ile 16 haneli şifre alın, `SMTP_PASSWORD`'a yazın.
- **Çeviri:** `ANTHROPIC_API_KEY` boşsa yeni ürünler otomatik çevrilmez (site Türkçe metni gösterir). Paneldeki çeviri alanlarını elle de doldurabilirsiniz.
- **Fotoğraflar** MongoDB içinde saklanır; yedek alınca fotoğraflar da yedeklenir.
