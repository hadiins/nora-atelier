"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setMsg(data.message || "کد تایید ارسال شد.");
        if (data.devCode) setCode(data.devCode);
      } else {
        setError(data.error || "خطا در ارسال کد");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ ورود موفقیت‌آمیز! در حال انتقال به پروفایل...");
        window.location.href = "/profile";
      } else {
        setError(data.error || "کد نامعتبر یا منقضی شده است.");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-4">
      <div className="bg-cream max-w-md w-full rounded-[2rem] p-8 shadow-2xl border border-black/5 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex w-12 h-12 rounded-full bg-charcoal text-cream items-center justify-center font-black text-xl">ن</Link>
          <h1 className="text-2xl font-black">ورود به آتلیه نورا</h1>
          <p className="text-xs text-muted">با شماره موبایل خود وارد شوید یا ثبت‌نام کنید</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              required
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="w-full bg-white border border-black/10 rounded-full px-5 py-3.5 text-sm text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button disabled={loading} className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
              {loading ? "در حال ارسال..." : "دریافت کد تایید پیامکی"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              required
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد ۶ رقمی"
              className="w-full bg-white border border-black/10 rounded-full px-5 py-3.5 text-sm text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button disabled={loading} className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
              {loading ? "در حال بررسی..." : "تایید و ورود"}
            </button>
            <button type="button" onClick={() => { setStep("phone"); setError(""); setMsg(""); }} className="w-full text-xs text-muted hover:text-charcoal">
              تغییر شماره موبایل
            </button>
          </form>
        )}

        {msg && <p className="text-xs text-center font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl">{msg}</p>}
        {error && <p className="text-xs text-center font-bold text-rose-600 bg-rose-50 p-3 rounded-2xl">{error}</p>}
      </div>
    </div>
  );
}
