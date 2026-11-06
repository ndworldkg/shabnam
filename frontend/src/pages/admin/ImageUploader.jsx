import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, Star } from "lucide-react";
import { api, img, errMsg } from "@/lib/api";

export const ImageUploader = ({ value = [], onChange, multiple = true, testid = "image-uploader" }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const upload = async (files) => {
    setBusy(true);
    const urls = [];
    for (const file of Array.from(files || [])) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const r = await api.post("/upload", fd);
        if (r.data?.url) urls.push(r.data.url);
      } catch (e) {
        toast.error(`${file.name}: ${errMsg(e, "yüklenemedi")}`);
      }
    }
    setBusy(false);
    if (urls.length) onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    if (ref.current) ref.current.value = "";
  };

  const remove = (u) => onChange(value.filter((x) => x !== u));
  const cover = (u) => onChange([u, ...value.filter((x) => x !== u)]);

  return (
    <div data-testid={testid}>
      <div className="flex flex-wrap gap-3">
        {value.map((u, i) => (
          <div key={u} className="group relative h-28 w-24 overflow-hidden rounded-xl border border-white/15">
            <img src={img(u)} alt="" className="h-full w-full object-cover" />
            {i === 0 && multiple && <span className="absolute left-1 top-1 rounded bg-[#FF5722] px-1.5 text-[10px] font-bold">KAPAK</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              {multiple && i > 0 ? <button type="button" onClick={() => cover(u)} title="Kapak yap" data-testid={`${testid}-cover-${i}`}><Star className="h-4 w-4 text-[#FACC15]" /></button> : <span />}
              <button type="button" onClick={() => remove(u)} title="Kaldır" data-testid={`${testid}-remove-${i}`}><X className="h-4 w-4 text-red-400" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} data-testid={`${testid}-button`}
          className="flex h-28 w-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 text-xs text-slate-300 transition-colors hover:border-[#FF5722] hover:text-white">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? "Yükleniyor" : "Fotoğraf yükle"}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => upload(e.target.files)} data-testid={`${testid}-input`} />
    </div>
  );
};
