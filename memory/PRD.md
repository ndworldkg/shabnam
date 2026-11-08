# Shabnam Elegant — İş Elbiseleri Tanıtım Sitesi

## Original problem statement
"İş elbiseleri üreten bir firmaya ürünleri tanıtan bir web sitesi ürünleri kendisi yükleme yapıp bilgileri kendisi güncellesin"

User choices: Firma adı "Shabnam elegant"; admin girişi Google ile; fotoğraflar bilgisayardan yükleme; bölümler: ana sayfa, kategoriler, ürün detay, iletişim formu, katalog, teklif isteme formu; tasarım: endüstriyel/kurumsal + renkli/modern.

## Architecture
- FastAPI (/api) + MongoDB; Emergent Google Auth (owner = first login, + allow-list); Emergent Object Storage for images (/api/upload, /api/files/{path})
- React + Tailwind + framer-motion + lenis. Routes: /, /urunler, /urunler/:id, /teklif, /iletisim, /admin
- Collections: categories, products, quotes, messages, users, user_sessions, files, meta(settings/owner/admins)

## Personas
- Firma sahibi/yönetici (ürün & bilgi yönetimi), kurumsal alıcılar (katalog, teklif)

## Implemented (2026-11-06)
- Kinetic hero (masked line reveal, 3D tilt, scroll parallax, reflective tape shine), slow marquee, category bento, featured products, process, CTA, footer
- Catalog with category filter + search; product detail with gallery/specs + prefilled quote form
- Quote form & contact form (stored, visible in admin)
- Admin: Google login, product CRUD + multi image upload (cover), category CRUD with image & accent color, quotes (status), messages (read), company settings + extra admin emails
- Seed: 5 categories, 8 example products (placeholders in [brackets])

## Implemented (2026-11-08)
- Quote email alert (Emergent managed Resend) → settings.notification_email or owner email; background task; 5 quotes/10min per IP limit
- PDF catalog: GET /api/catalog.pdf (reportlab, bundled Liberation Sans for Turkish), buttons on catalog page + footer
- Floating WhatsApp button (shows when settings.whatsapp set)
- Admin product ordering: drag & drop + up/down arrows (POST /api/products/reorder, `order` field)

## Backlog
- P1: Email notification on new quote/message; product drag-sort; PDF catalog download
- P2: Multi-language (EN/AR), SEO meta per product, WhatsApp floating button
