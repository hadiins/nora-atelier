"use client";

import React, { useState } from "react";

export default function ProfileForm({
  initialName,
  initialAddress,
  initialPostalCode,
}: {
  initialName: string;
  initialAddress: string;
  initialPostalCode: string;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [defaultAddress, setDefaultAddress] = useState(initialAddress);
  const [defaultPostalCode, setDefaultPostalCode] = useState(initialPostalCode);
  const [msg, setMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, defaultAddress, defaultPostalCode }),
    });
    setMsg(res.ok ? "✅ مشخصات و نشانی پیش‌فرض شما ذخیره شد." : "❌ خطا در ذخیره اطلاعات.");
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-black/5 space-y-4">
      <h2 className="font-bold text-base">مشخصات هویتی و نشانی پیش‌فرض (برای خرید سریع)</h2>
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" className="bg-sand rounded-xl px-4 py-3" />
        <input dir="ltr" value={defaultPostalCode} onChange={(e) => setDefaultPostalCode(e.target.value)} placeholder="کد پستی ۱۰ رقمی" className="bg-sand rounded-xl px-4 py-3 text-right" />
        <textarea rows={2} value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} placeholder="نشانی دقیق پستی" className="sm:col-span-2 bg-sand rounded-xl px-4 py-3" />
      </div>
      <button className="bg-charcoal text-cream px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gold transition">
        ذخیره اطلاعات پروفایل
      </button>
      {msg && <p className="text-xs font-bold text-emerald-700">{msg}</p>}
    </form>
  );
}
