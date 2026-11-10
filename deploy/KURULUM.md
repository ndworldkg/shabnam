# Shabnam Elegant — Hostinger VPS Kurulum Rehberi (Docker Manager + GitHub)

Bu rehber siteyi **Hostinger VPS** üzerinde, **Docker Manager** ile doğrudan **GitHub** deposundan yayına almayı anlatır.
Sistem 3 parçadan oluşur ve hepsi otomatik kurulur:

| Servis | Görevi |
|---|---|
| `web` (Caddy) | Siteyi yayınlar, **HTTPS sertifikasını otomatik** alır ve yeniler, `/api` isteklerini backend'e iletir |
| `backend` (FastAPI) | Ürünler, kategoriler, teklifler, yönetim paneli, PDF katalog, e-posta ve Telegram bildirimleri |
| `mongo` (MongoDB 7) | Veritabanı ve ürün fotoğrafları. **İlk açılışta mevcut verileriniz otomatik yüklenir** |

Gerekenler: Hostinger VPS (KVM 1 / 4 GB RAM yeterli), bir alan adı, GitHub hesabı.

---

## 1. VPS işletim sistemi
hPanel → **VPS** → sunucunuz → **İşletim Sistemi** → **Ubuntu 24.04 with Docker** şablonunu seçin
(sunucuda zaten Docker varsa bu adımı atlayın). Docker Manager menüsü bu şablonla aktif olur.

> Sunucuda 80/443 portlarını kullanan başka bir uygulama (Nginx, Apache, Traefik, CloudPanel vb.) **olmamalı**.

## 2. Alan adını VPS'e yönlendirin
hPanel → **Alan Adları** → alan adınız → **DNS / Nameserver'lar**:
- `@` için **A** kaydı → VPS IP adresiniz (VPS özet sayfasında yazar)
- `www` kullanacaksanız: `www` için **CNAME** → `ornek-site.com`
- Aynı ad için eski A kayıtları varsa silin.

DNS'in yayılması 5 dk – birkaç saat sürebilir. Sertifika, alan adı VPS'e yönlenince otomatik alınır.

## 3. Güvenlik duvarı
hPanel → VPS → **Güvenlik → Firewall**: kural kullanıyorsanız **TCP 22, 80, 443** ve **UDP 443** açık olmalı.

## 4. Kodu GitHub'a gönderin
Emergent sohbet ekranındaki **"Save to GitHub"** ile kodu bir depoya gönderin (ör. `shabnam-elegant`).

**Depo özel (private) ise** VPS'in depoyu okuyabilmesi için bir "Deploy key" ekleyin.
hPanel → VPS → **Tarayıcı terminali** (veya SSH) açın:
```bash
ssh-keygen -t ed25519 -C "shabnam" -N "" -f ~/.ssh/shabnam
cat ~/.ssh/shabnam.pub
```
Çıkan satırı kopyalayın → GitHub'da depo → **Settings → Deploy keys → Add deploy key** → yapıştırın → **Add key**.

## 5. Docker Manager ile yayınlayın
1. hPanel → VPS → **Docker Manager** → **Compose** → **Compose from URL**.
2. URL alanına depo adresini yazın: `https://github.com/KULLANICI/shabnam-elegant`
   (özel depo için: `git@github.com:KULLANICI/shabnam-elegant.git`).
   `docker-compose.yml` dosyası deponun **kök dizinindedir**, otomatik bulunur.
3. Proje adı: `shabnam-elegant`
4. **Environment** bölümüne `deploy/env.example` dosyasındaki değişkenleri kendi bilgilerinizle girin:

| Değişken | Açıklama |
|---|---|
| `DOMAIN` | Alan adınız, `www` ve `https://` olmadan (ör. `shabnamelegant.uz`) |
| `DB_NAME` | `shabnam` (değiştirmeyin) |
| `ADMIN_EMAIL` | Yönetici e-postası |
| `ADMIN_PASSWORD` | Güçlü bir şifre (yalnızca veritabanında yönetici yoksa kullanılır) |
| `JWT_SECRET` | 64 karakterlik rastgele metin — terminalde `openssl rand -hex 32` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | E-posta hesabınız (aşağıya bakın) |
| `EMAIL_FROM_NAME` | Gönderen adı, ör. `Shabnam Elegant` |
| `TELEGRAM_BOT_TOKEN` | İsteğe bağlı, @BotFather'dan |

5. **Deploy** düğmesine basın. İlk kurulum 5–10 dakika sürer (site derlenir).
6. Tamamlanınca `https://ALAN-ADINIZ` açılır. Kayıtlar için Docker Manager → proje → **Logs**.

### Verileriniz
`deploy/data/shabnam.archive.gz` dosyası Emergent'teki **tüm ürün, kategori, fotoğraf, ayar ve yönetici hesabınızın** yedeğidir.
Veritabanı ilk kez oluşturulurken **otomatik yüklenir** — ekstra bir şey yapmanız gerekmez.
(Sonraki güncellemelerde tekrar yüklenmez; VPS'teki veriler korunur.)

## 6. Yönetim paneli
Sitede yönetim butonu **görünmez**. Panele doğrudan adresle girin: **`https://ALAN-ADINIZ/admin`**
- Verileriniz yüklendiği için Emergent'te kullandığınız **son şifreniz** geçerlidir.
- Panel dili: sol üstteki **TR / RU** düğmesiyle Türkçe ↔ Rusça.
- Şifreyi unutursanız giriş ekranında **"Şifremi unuttum"** (SMTP ayarlı olmalı) veya terminalde:
```bash
docker exec -it $(docker ps -qf name=backend) python reset_admin_password.py YENI-SIFRE
```

## 7. E-posta (SMTP) ayarları
- **Hostinger e-posta** (alan adınıza bağlı, ör. `info@alanadiniz.uz`): `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, kullanıcı = tam e-posta adresi, şifre = e-posta şifresi.
- **Gmail:** Google hesabında 2 adımlı doğrulamayı açın → **Uygulama şifreleri** → 16 haneli şifre. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`.
- Bildirimlerin gideceği adres panelde **Firma Bilgileri → Teklif bildirimlerinin gideceği e-posta** alanından değiştirilir.

## 8. Güncelleme
Emergent'te değişiklik yaptıktan sonra tekrar **Save to GitHub** yapın, ardından:
- **Elle:** Docker Manager → proje → **Update / Redeploy** (GitHub'dan son kodu çekip yeniden derler), **veya**
- **Otomatik (GitHub Actions):** her gönderimde site kendiliğinden güncellenir:
  1. hPanel → profil → **API** → yeni **API anahtarı** oluşturun.
  2. VPS numaranız (VM ID): hPanel'de VPS adresindeki sayı (`.../vps/123456/...`).
  3. GitHub → depo → **Settings → Secrets and variables → Actions**:
     - **Secrets:** `HOSTINGER_API_KEY` = API anahtarı, `APP_ENV` = 5. adımda girdiğiniz değişkenlerin tamamı (her satıra `AD=değer`)
     - **Variables:** `HOSTINGER_VM_ID` = VPS numarası
  4. Bu ayarlar yoksa iş otomatik atlanır; hata vermez. Dosya: `.github/workflows/deploy.yml`

## 9. Yedek alma
Tarayıcı terminalinde:
```bash
docker exec $(docker ps -qf name=mongo) mongodump --db=shabnam --archive=/data/db/yedek.gz --gzip
docker cp $(docker ps -qf name=mongo):/data/db/yedek.gz ./yedek-$(date +%F).gz
```
Fotoğraflar da veritabanında (GridFS) saklandığı için bu tek dosya tüm siteyi kapsar.

## Sorun giderme
| Belirti | Çözüm |
|---|---|
| Site açılmıyor / sertifika hatası | A kaydı VPS IP'sine yönlenmiş mi? `ping ALAN-ADINIZ`. 80/443 portları açık ve boş mu? Docker Manager → Logs → `web` |
| `port is already allocated` | 80/443'ü kullanan başka uygulamayı durdurun (`docker ps`, `systemctl stop nginx apache2`) |
| `DOMAIN gerekli` vb. hata | Environment bölümünde ilgili değişken eksik |
| E-posta gelmiyor | SMTP bilgileri ve port (465/587) doğru mu? Spam klasörü. Logs → `backend` |
| Sistem durumu | `https://ALAN-ADINIZ/api/health` → `{"ok":true}` |

## SSH ile elle kurulum (alternatif)
```bash
git clone https://github.com/KULLANICI/shabnam-elegant.git && cd shabnam-elegant
cp deploy/env.example .env && nano .env
docker compose up -d --build
# güncelleme: git pull && docker compose up -d --build
```
