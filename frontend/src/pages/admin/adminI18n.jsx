import { createContext, useContext, useState } from "react";

const TR = {
  common: { save: "Kaydet", saving: "Kaydediliyor...", cancel: "Vazgeç", confirmDelete: (n) => `"${n}" silinsin mi?`, deleteRecord: "Kayıt silinsin mi?", saveFail: "Kaydedilemedi" },
  tabs: { products: "Ürünler", categories: "Kategoriler", quotes: "Teklifler", messages: "Mesajlar", settings: "Firma Bilgileri" },
  app: { viewSite: "Siteyi görüntüle", logout: "Çıkış yap" },
  login: { title: "Yönetim Paneli", sub: "Ürünleri ve firma bilgilerini yönetmek için giriş yapın.", email: "E-posta", password: "Şifre", forgot: "Şifremi unuttum", submit: "Giriş Yap", fail: "Giriş yapılamadı", back: "← Siteye dön" },
  forgot: { title: "Şifremi unuttum", sub: "Yönetici e-posta adresinizi yazın; şifre sıfırlama bağlantısı gönderelim.", sent: "Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunuzu (ve spam klasörünü) kontrol edin. Bağlantı 1 saat geçerlidir.", submit: "Bağlantı Gönder", fail: "İstek gönderilemedi", back: "← Girişe dön" },
  reset: { mismatch: "Şifreler eşleşmiyor", fail: "Şifre güncellenemedi", doneTitle: "Şifre güncellendi", doneText: "Yeni şifrenizle giriş yapabilirsiniz.", goLogin: "Giriş ekranına git", title: "Yeni şifre", sub: "En az 8 karakterli yeni bir şifre belirleyin.", pw: "Yeni şifre", pw2: "Yeni şifre tekrar", missing: "Bağlantı eksik. E-postadaki bağlantıyı kullanın.", submit: "Şifreyi Kaydet" },
  products: { title: "Ürünler", sub: (n) => `${n} ürün · Sıralamak için sürükleyip bırakın veya okları kullanın`, add: "Yeni Ürün", search: "Ürün ara", featured: "Öne çıkan", inactive: "Yayında değil", empty: "Ürün bulunamadı.", deleted: "Ürün silindi", orderSaved: "Sıralama kaydedildi", orderFail: "Sıralama kaydedilemedi", up: "Yukarı taşı", down: "Aşağı taşı" },
  dialog: { edit: "Ürünü Düzenle", create: "Yeni Ürün", photos: "Fotoğraflar (ilk fotoğraf kapak olur)", name: "Ürün adı", code: "Ürün kodu", category: "Kategori", noSpecs: "Bu kategori için özellik alanı tanımlanmamış. Kategoriler sayfasından ekleyebilirsiniz.", sizes: "Bedenler / numaralar (virgülle)", colors: "Renkler (virgülle)", price: "Başlangıç fiyatı (so'm)", pricePh: "Örn. 150000", summary: "Kısa açıklama", description: "Detaylı açıklama", features: "Özellikler (her satıra bir tane)", featuredSw: "Ana sayfada öne çıkar", activeSw: "Sitede yayında", showPrice: "Fiyatı sitede göster", needCat: "Önce bir kategori oluşturun.", updated: "Ürün güncellendi", added: "Ürün eklendi" },
  i18n: { title: "Sitede görünen diller", note: "Site Rusça ve Özbekçe gösterilir. Her dilin metnini kendiniz yazın; boş bırakılan alanda yukarıdaki ana metin gösterilir.", ph: "Elle yazın", ru: "Rusça", uz: "Özbekçe" },
  categories: { title: "Kategoriler", sub: "Sıra numarası küçük olan önce gösterilir", add: "Yeni Kategori", saved: "Kategori kaydedildi", deleted: "Kategori silindi", meta: (o, n, s) => `Sıra ${o} · ${n} ürün · ${s} özellik alanı`, edit: "Kategoriyi Düzenle", create: "Yeni Kategori", cover: "Kapak fotoğrafı", name: "Kategori adı", desc: "Açıklama", order: "Sıra", accent: "Vurgu rengi", specField: (l) => `Alan: ${l}` },
  spec: { title: "Ürün özellik alanları", sub: "Bu kategorideki ürünlerde hangi bilgiler doldurulsun? Hazır şablon seçin veya kendiniz ekleyin.", preset: (l) => `${l} şablonu`, labelPh: "Alan adı (örn. Taban malzemesi)", remove: "Kaldır", add: "Alan ekle", sizes: "Varsayılan bedenler / numaralar (virgülle)", sizesPh: "S, M, L veya 39, 40, 41" },
  settings: { title: "Firma Bilgileri", sub: "Sitede gösterilen iletişim ve firma bilgileri", saved: "Firma bilgileri güncellendi", company_name: "Firma adı", tagline: "Slogan / kısa tanım", phone: "Telefon", email: "E-posta", whatsapp: "WhatsApp numarası (ülke koduyla, örn. 998...)", working_hours: "Çalışma saatleri", notification_email: "Teklif bildirimlerinin gideceği e-posta (boşsa ana yönetici)", address: "Adres", about: "Hakkımızda", map_location: "Harita konumu (adres veya Google Maps linki)", social: "Sosyal medya hesapları", socialNote: "Linki boş olan hesap sitede soluk görünür ve tıklanmaz.", linkPh: "https://..." },
  telegram: { title: "Telegram bildirimleri", help: "Botunuza Telegram'dan bir mesaj yazın (veya botu grubunuza ekleyin), sonra \"Sohbeti bul\" butonuna basın.", chatId: "Telegram Chat ID", ph: "Örn. 123456789", find: "Sohbeti bul", test: "Test", notFound: "Sohbet bulunamadı. Önce bota Telegram'dan bir mesaj yazın, sonra tekrar deneyin.", sent: "Test mesajı gönderildi. Kaydetmeyi unutmayın." },
  password: { mismatch: "Yeni şifreler eşleşmiyor", changed: "Şifre değiştirildi", fail: "Şifre değiştirilemedi (en az 8 karakter olmalı)", title: "Şifre değiştir", current: "Mevcut şifre", next: "Yeni şifre (en az 8)", confirm: "Yeni şifre tekrar", submit: "Şifreyi Güncelle" },
  inbox: { quotesTitle: "Teklif Talepleri", quotesSub: (n) => `${n} talep`, product: "Ürün", general: "Genel", qty: "Adet", logo: "Logo", yes: "Evet", no: "Hayır", emptyQuotes: "Henüz teklif talebi yok.", statusFail: "Güncellenemedi", messagesTitle: "Mesajlar", messagesSub: (n) => `${n} mesaj`, noSubject: "Konu yok", emptyMessages: "Henüz mesaj yok.", status: { yeni: "yeni", "görüşülüyor": "görüşülüyor", "tamamlandı": "tamamlandı", iptal: "iptal" } },
  upload: { uploading: "Yükleniyor", upload: "Fotoğraf yükle", cover: "KAPAK", makeCover: "Kapak yap", remove: "Kaldır", failed: "yüklenemedi" },
};

const RU = {
  common: { save: "Сохранить", saving: "Сохранение...", cancel: "Отмена", confirmDelete: (n) => `Удалить «${n}»?`, deleteRecord: "Удалить запись?", saveFail: "Не удалось сохранить" },
  tabs: { products: "Товары", categories: "Категории", quotes: "Запросы", messages: "Сообщения", settings: "Данные компании" },
  app: { viewSite: "Открыть сайт", logout: "Выйти" },
  login: { title: "Панель управления", sub: "Войдите, чтобы управлять товарами и данными компании.", email: "E-mail", password: "Пароль", forgot: "Забыли пароль?", submit: "Войти", fail: "Не удалось войти", back: "← Вернуться на сайт" },
  forgot: { title: "Забыли пароль", sub: "Введите e-mail администратора — мы отправим ссылку для сброса пароля.", sent: "Если этот адрес зарегистрирован, ссылка для сброса отправлена. Проверьте входящие (и папку «Спам»). Ссылка действует 1 час.", submit: "Отправить ссылку", fail: "Не удалось отправить запрос", back: "← Назад ко входу" },
  reset: { mismatch: "Пароли не совпадают", fail: "Не удалось обновить пароль", doneTitle: "Пароль обновлён", doneText: "Теперь вы можете войти с новым паролем.", goLogin: "Перейти ко входу", title: "Новый пароль", sub: "Задайте новый пароль длиной не менее 8 символов.", pw: "Новый пароль", pw2: "Повторите пароль", missing: "Ссылка неполная. Используйте ссылку из письма.", submit: "Сохранить пароль" },
  products: { title: "Товары", sub: (n) => `${n} товаров · Перетащите или используйте стрелки для сортировки`, add: "Новый товар", search: "Поиск товара", featured: "Избранный", inactive: "Не опубликован", empty: "Товары не найдены.", deleted: "Товар удалён", orderSaved: "Порядок сохранён", orderFail: "Не удалось сохранить порядок", up: "Вверх", down: "Вниз" },
  dialog: { edit: "Редактировать товар", create: "Новый товар", photos: "Фотографии (первая — обложка)", name: "Название товара", code: "Код товара", category: "Категория", noSpecs: "Для этой категории не заданы поля характеристик. Добавьте их на странице «Категории».", sizes: "Размеры (через запятую)", colors: "Цвета (через запятую)", price: "Цена от (сум)", pricePh: "Напр. 150000", summary: "Краткое описание", description: "Подробное описание", features: "Особенности (по одной в строке)", featuredSw: "Показать на главной", activeSw: "Опубликован на сайте", showPrice: "Показывать цену на сайте", needCat: "Сначала создайте категорию.", updated: "Товар обновлён", added: "Товар добавлен" },
  i18n: { title: "Языки сайта", note: "Сайт показывается на русском и узбекском. Заполните текст для каждого языка вручную; если поле пустое, показывается основной текст выше.", ph: "Введите вручную", ru: "Русский", uz: "Узбекский" },
  categories: { title: "Категории", sub: "Категории с меньшим номером показываются первыми", add: "Новая категория", saved: "Категория сохранена", deleted: "Категория удалена", meta: (o, n, s) => `Порядок ${o} · ${n} товаров · ${s} полей`, edit: "Редактировать категорию", create: "Новая категория", cover: "Обложка", name: "Название категории", desc: "Описание", order: "Порядок", accent: "Цвет акцента", specField: (l) => `Поле: ${l}` },
  spec: { title: "Поля характеристик товара", sub: "Какие данные заполнять у товаров этой категории? Выберите шаблон или добавьте поля сами.", preset: (l) => `Шаблон «${l}»`, labelPh: "Название поля (напр. Материал подошвы)", remove: "Удалить", add: "Добавить поле", sizes: "Размеры по умолчанию (через запятую)", sizesPh: "S, M, L или 39, 40, 41" },
  settings: { title: "Данные компании", sub: "Контакты и информация о компании, которые показываются на сайте", saved: "Данные компании обновлены", company_name: "Название компании", tagline: "Слоган / краткое описание", phone: "Телефон", email: "E-mail", whatsapp: "Номер WhatsApp (с кодом страны, напр. 998...)", working_hours: "Часы работы", notification_email: "E-mail для уведомлений о запросах (если пусто — администратор)", address: "Адрес", about: "О компании", map_location: "Место на карте (адрес или ссылка Google Maps)", social: "Социальные сети", socialNote: "Если ссылка пустая, значок на сайте будет бледным и некликабельным.", linkPh: "https://..." },
  telegram: { title: "Уведомления в Telegram", help: "Напишите боту в Telegram (или добавьте бота в группу), затем нажмите «Найти чат».", chatId: "Telegram Chat ID", ph: "Напр. 123456789", find: "Найти чат", test: "Тест", notFound: "Чат не найден. Сначала напишите боту в Telegram и попробуйте снова.", sent: "Тестовое сообщение отправлено. Не забудьте сохранить." },
  password: { mismatch: "Новые пароли не совпадают", changed: "Пароль изменён", fail: "Не удалось изменить пароль (минимум 8 символов)", title: "Сменить пароль", current: "Текущий пароль", next: "Новый пароль (мин. 8)", confirm: "Повторите новый пароль", submit: "Обновить пароль" },
  inbox: { quotesTitle: "Запросы цены", quotesSub: (n) => `${n} запросов`, product: "Товар", general: "Общий", qty: "Кол-во", logo: "Логотип", yes: "Да", no: "Нет", emptyQuotes: "Запросов пока нет.", statusFail: "Не удалось обновить", messagesTitle: "Сообщения", messagesSub: (n) => `${n} сообщений`, noSubject: "Без темы", emptyMessages: "Сообщений пока нет.", status: { yeni: "новый", "görüşülüyor": "в работе", "tamamlandı": "завершён", iptal: "отменён" } },
  upload: { uploading: "Загрузка", upload: "Загрузить фото", cover: "ОБЛОЖКА", makeCover: "Сделать обложкой", remove: "Удалить", failed: "не загружено" },
};

const ERR_RU = {
  "Bir hata oluştu": "Произошла ошибка",
  "E-posta veya şifre hatalı": "Неверный e-mail или пароль",
  "Giriş gerekli": "Требуется вход",
  "Geçersiz oturum": "Недействительная сессия",
  "Oturum süresi doldu": "Сессия истекла",
  "Yetkiniz yok": "Нет доступа",
  "Mevcut şifre hatalı": "Неверный текущий пароль",
  "Çok fazla deneme. 15 dakika sonra tekrar deneyin.": "Слишком много попыток. Повторите через 15 минут.",
  "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.": "Слишком много неудачных попыток. Повторите через 15 минут.",
  "Bağlantı geçersiz veya süresi dolmuş. Yeniden şifre sıfırlama isteği gönderin.": "Ссылка недействительна или устарела. Запросите сброс пароля ещё раз.",
  "Bu kategoride ürün var. Önce ürünleri taşıyın veya silin.": "В этой категории есть товары. Сначала перенесите или удалите их.",
  "Dosya 10MB'dan büyük olamaz": "Файл не может быть больше 10 МБ",
  "Sadece görsel dosyaları yüklenebilir": "Можно загружать только изображения",
  "Kategori bulunamadı": "Категория не найдена",
  "Ürün bulunamadı": "Товар не найден",
  "Telegram bot anahtarı henüz eklenmedi.": "Токен Telegram-бота ещё не добавлен.",
  "Mesaj gönderilemedi. Chat ID'yi ve botun bu sohbete ekli olduğunu kontrol edin.": "Не удалось отправить сообщение. Проверьте Chat ID и что бот добавлен в чат.",
};

export const ADMIN_DICT = { tr: TR, ru: RU };
const KEY = "admin_lang";
export const adminLang = () => (localStorage.getItem(KEY) === "ru" ? "ru" : "tr");
export const trErr = (msg) => (adminLang() === "ru" && ERR_RU[msg]) || msg;

const Ctx = createContext({ lang: "tr", setLang: () => {}, t: TR });

export const AdminLangProvider = ({ children }) => {
  const [lang, setLangState] = useState(adminLang);
  const setLang = (l) => {
    localStorage.setItem(KEY, l);
    setLangState(l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: ADMIN_DICT[lang] }}>{children}</Ctx.Provider>;
};

export const useAdminLang = () => useContext(Ctx);

export const AdminLangSwitch = ({ id = "main" }) => {
  const { lang, setLang } = useAdminLang();
  return (
    <div className="inline-flex rounded-full border border-white/15 p-1" data-testid={`admin-lang-switch-${id}`}>
      {["tr", "ru"].map((l) => (
        <button type="button" key={l} onClick={() => setLang(l)} data-testid={`admin-lang-${id}-${l}`}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors ${lang === l ? "bg-[#F2962B] text-white" : "text-slate-300 hover:text-white"}`}>{l}</button>
      ))}
    </div>
  );
};
