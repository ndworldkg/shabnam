const F = {
  kumas: { tr: "Kumaş", ru: "Ткань", uz: "Mato" },
  gramaj: { tr: "Gramaj", ru: "Плотность", uz: "Zichlik" },
  astar: { tr: "Astar", ru: "Подкладка", uz: "Astar" },
  cep: { tr: "Cep sayısı", ru: "Количество карманов", uz: "Cho'ntaklar soni" },
  saya: { tr: "Saya malzemesi", ru: "Материал верха", uz: "Ustki qism materiali" },
  taban: { tr: "Taban malzemesi", ru: "Материал подошвы", uz: "Taglik materiali" },
  burun: { tr: "Burun koruması", ru: "Защитный подносок", uz: "Burun himoyasi" },
  su: { tr: "Su geçirmezlik", ru: "Водонепроницаемость", uz: "Suv o'tkazmaslik" },
  sinif: { tr: "Güvenlik sınıfı", ru: "Класс защиты", uz: "Xavfsizlik klassi" },
  malzeme: { tr: "Malzeme", ru: "Материал", uz: "Material" },
  ayar: { tr: "Ayar tipi", ru: "Тип регулировки", uz: "Sozlash turi" },
  hava: { tr: "Havalandırma", ru: "Вентиляция", uz: "Shamollatish" },
  alan: { tr: "Kullanım alanı", ru: "Область применения", uz: "Qo'llanish sohasi" },
  kaplama: { tr: "Kaplama", ru: "Покрытие", uz: "Qoplama" },
};

export const SPEC_PRESETS = [
  { id: "giyim", label: { tr: "Giyim", ru: "Одежда" }, sizes: ["S", "M", "L", "XL", "XXL"], fields: [F.kumas, F.gramaj, F.astar, F.cep] },
  { id: "ayakkabi", label: { tr: "Ayakkabı", ru: "Обувь" }, sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"], fields: [F.saya, F.taban, F.burun, F.su, F.sinif] },
  { id: "baslik", label: { tr: "Şapka / Başlık", ru: "Головные уборы" }, sizes: ["Standart", "Ayarlanabilir"], fields: [F.malzeme, F.ayar, F.hava, F.alan] },
  { id: "eldiven", label: { tr: "Eldiven", ru: "Перчатки" }, sizes: ["7", "8", "9", "10", "11"], fields: [F.malzeme, F.kaplama, F.alan] },
];

const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

export const makeKey = (label, taken = []) => {
  const base = label.toLowerCase().replace(/[çğıöşü]/g, (c) => TR[c]).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "alan";
  let key = base;
  let i = 2;
  while (taken.includes(key)) key = `${base}_${i++}`;
  return key;
};
