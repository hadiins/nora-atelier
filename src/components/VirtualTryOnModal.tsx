"use client";

import React, { useState } from "react";

export default function VirtualTryOnModal({ garmentImage, onClose }: { garmentImage: string; onClose: () => void }) {
  const [userImg, setUserImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!userImg) return;
    setLoading(true);
    const res = await fetch("/api/try-on", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garmentImageUrl: garmentImage, userImageBase64: userImg }),
    });
    const data = await res.json();
    setLoading(false);
    setResultMsg(data.message || "پیش‌نمایش پرو مجازی آماده شد!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black">پرو مجازی لباس با هوش مصنوعی</h3>
          <button onClick={onClose} className="font-bold">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-sand border border-black/10 flex items-center justify-center">
            {userImg ? (
              <img src={userImg} alt="تصویر شما" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer text-center p-4 text-xs font-bold text-muted">
                <span>+ آپلود عکس تمام‌قد یا نیم‌تنه شما</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            )}
          </div>
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-sand border border-black/10">
            <img src={garmentImage} alt="لباس انتخابی" className="w-full h-full object-cover" />
          </div>
        </div>

        <button
          disabled={!userImg || loading}
          onClick={handleTryOn}
          className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition disabled:opacity-50"
        >
          {loading ? "در حال پردازش هوش مصنوعی..." : "مشاهده تن‌خور لباس روی عکس من"}
        </button>

        {resultMsg && <p className="text-xs text-center font-bold text-emerald-700">{resultMsg}</p>}
      </div>
    </div>
  );
}
