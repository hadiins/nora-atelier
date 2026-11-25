"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ScentClubPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [scentPref, setScentPref] = useState("woody");
  const [msg, setMsg] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/scent-club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, scentPref }),
    });
    if (res.ok) {
      setMsg("✅ عضویت شما در باشگاه ماهانه عطر نورا ثبت شد!");
      setFullName("");
      setPhone("");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <Link href="/" className="text-xs text-goldLight hover:underline">← بازگشت به فروشگاه</Link>
        <h1 className="text-4xl font-black">باشگاه اشتراک ماهانه عطر نیش</h1>
        <p className="text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
          هر ماه یک اتومایزر ۸ میلی‌لیتری اورجینال از کمیاب‌ترین عطرهای نیش دنیا متناسب با طبع بویایی شما، در بسته‌بندی اختصاصی ارسال می‌شود.
        </p>

        <form onSubmit={handleJoin} className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md mx-auto space-y-4 text-right">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-3 text-sm" />
          <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-3 text-sm text-right" />
          <select value={scentPref} onChange={(e) => setScentPref(e.target.value)} className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-3 text-sm">
            <option value="woody">گروه چوبی و عود</option>
            <option value="spicy">گروه ادویه‌ای و کهربا</option>
            <option value="fresh">گروه خنک و مرکباتی</option>
            <option value="floral">گروه گلی و وانیلی</option>
          </select>
          <button className="w-full bg-goldLight text-obsidian py-3.5 rounded-full text-sm font-black hover:bg-white transition">
            عضویت ماهانه (۹۸۰,۰۰۰ تومان / ماه)
          </button>
          {msg && <p className="text-xs text-center text-emerald-400 font-bold">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
