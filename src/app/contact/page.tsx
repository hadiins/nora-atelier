"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("پشتیبانی سفارش");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, subject, message }),
    });
    if (res.ok) {
      setSent(true);
      setFullName(""); setPhone(""); setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-sand py-14 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-[2rem] p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black">تماس با پشتیبانی آتلیه نورا</h1>
          <Link href="/" className="text-xs text-muted">بازگشت</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام و نام خانوادگی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-sand rounded-xl px-4 py-3 text-sm">
            <option>پشتیبانی سفارش</option>
            <option>مشاوره سایز و عطر</option>
            <option>همکاری و خرید سازمانی</option>
          </select>
          <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="پیام شما..." className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <button className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">ارسال پیام</button>
          {sent && <p className="text-xs font-bold text-emerald-700 text-center">✅ پیام شما ثبت شد؛ همکاران ما با شما تماس می‌گیرند.</p>}
        </form>
      </div>
    </div>
  );
}
