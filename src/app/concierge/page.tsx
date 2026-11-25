"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ConciergePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("ست رسمی و مجلسی");
  const [preferredAt, setPreferredAt] = useState("فردا ساعت ۱۷:۰۰");
  const [msg, setMsg] = useState("");

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/concierge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, topic, preferredAt }),
    });
    if (res.ok) {
      setMsg("✅ وقت مشاوره ویدیویی اختصاصی شما با استایلیست نورا ثبت شد.");
      setFullName("");
      setPhone("");
    }
  };

  return (
    <div className="min-h-screen bg-sand py-16 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-[2rem] p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black">مشاوره ویدیویی خصوصی (VIP)</h1>
          <Link href="/" className="text-xs text-muted">بازگشت</Link>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          یک جلسه ۱۵ دقیقه‌ای آنلاین با استایلیست یا کارشناس عطر آتلیه نورا برای انتخاب ست عروسی، هدیه سازمانی یا عطر کلکسیونی رزرو کنید.
        </p>
        <form onSubmit={handleBook} className="space-y-4">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-sand rounded-xl px-4 py-3 text-sm">
            <option>ست رسمی و مجلسی</option>
            <option>انتخاب عطر کلکسیونی</option>
            <option>هدایای سازمانی VIP</option>
          </select>
          <input required value={preferredAt} onChange={(e) => setPreferredAt(e.target.value)} placeholder="زمان پیشنهادی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <button className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
            رزرو رایگان جلسه ویدیویی
          </button>
          {msg && <p className="text-xs font-bold text-emerald-700 text-center">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
