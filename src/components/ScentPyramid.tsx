"use client";

import React, { useState } from "react";

interface Props {
  topNotes: string;
  midNotes: string;
  baseNotes: string;
}

export default function ScentPyramid({ topNotes, midNotes, baseNotes }: Props) {
  const [activeLayer, setActiveLayer] = useState<"top" | "mid" | "base">("top");

  const info = {
    top: { title: "نت اولیه (Top Notes)", desc: "اولین رایحه‌ای که بلافاصله پس از اسپری استشمام می‌شود (ماندگاری ۱۵ تا ۳۰ دقیقه).", notes: topNotes },
    mid: { title: "نت میانی / قلب عطر (Heart Notes)", desc: "شخصیت اصلی عطر که پس از محو شدن نت اولیه نمایان می‌شود (۲ تا ۴ ساعت).", notes: midNotes },
    base: { title: "نت پایه (Base Notes)", desc: "عمق و ماندگاری نهایی عطر روی پوست و لباس (۸ تا ۱۲ ساعت).", notes: baseNotes },
  };

  return (
    <div className="bg-sand p-5 rounded-3xl space-y-4 border border-black/5">
      <p className="text-xs font-black text-gold">هرم تعاملی نت‌های بویایی</p>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setActiveLayer("top")}
          className={`w-1/2 py-2.5 rounded-t-2xl text-xs font-bold transition ${
            activeLayer === "top" ? "bg-obsidian text-goldLight shadow-lg" : "bg-white text-charcoal hover:bg-black/5"
          }`}
        >
          نت اولیه
        </button>
        <button
          onClick={() => setActiveLayer("mid")}
          className={`w-3/4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeLayer === "mid" ? "bg-obsidian text-goldLight shadow-lg" : "bg-white text-charcoal hover:bg-black/5"
          }`}
        >
          نت میانی (قلب عطر)
        </button>
        <button
          onClick={() => setActiveLayer("base")}
          className={`w-full py-2.5 rounded-b-2xl text-xs font-bold transition ${
            activeLayer === "base" ? "bg-obsidian text-goldLight shadow-lg" : "bg-white text-charcoal hover:bg-black/5"
          }`}
        >
          نت پایه
        </button>
      </div>
      <div className="bg-white p-4 rounded-2xl text-xs space-y-1">
        <p className="font-black text-charcoal">{info[activeLayer].title}</p>
        <p className="text-gold font-bold">{info[activeLayer].notes}</p>
        <p className="text-muted text-[11px]">{info[activeLayer].desc}</p>
      </div>
    </div>
  );
}
