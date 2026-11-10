export const SPEC_PRESETS = [
  { id: "giyim", label: "Giyim", sizes: ["S", "M", "L", "XL", "XXL"], fields: ["Kumaş", "Gramaj", "Astar", "Cep sayısı"] },
  { id: "ayakkabi", label: "Ayakkabı", sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"], fields: ["Saya malzemesi", "Taban malzemesi", "Burun koruması", "Su geçirmezlik", "Güvenlik sınıfı"] },
  { id: "baslik", label: "Şapka / Başlık", sizes: ["Standart", "Ayarlanabilir"], fields: ["Malzeme", "Ayar tipi", "Havalandırma", "Kullanım alanı"] },
  { id: "eldiven", label: "Eldiven", sizes: ["7", "8", "9", "10", "11"], fields: ["Malzeme", "Kaplama", "Kullanım alanı"] },
];

const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

export const makeKey = (label, taken = []) => {
  const base = label.toLowerCase().replace(/[çğıöşü]/g, (c) => TR[c]).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "alan";
  let key = base;
  let i = 2;
  while (taken.includes(key)) key = `${base}_${i++}`;
  return key;
};
