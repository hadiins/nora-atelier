"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function LimitedDropsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, mins: 36, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-cream py-16 px-4 flex flex-col items-center justify-center text-center space-y-8">
      <Link href="/" className="text-xs text-goldLight">← بازگشت به فروشگاه</Link>
      <span className="px-4 py-1.5 rounded-full bg-goldLight/15 text-goldLight text-xs font-bold">LIMITED EDITION DROP</span>
      <h1 className="text-4xl sm:text-5xl font-black">کالکشن زمستانی کشمیر و عود سلطنتی</h1>
      <p className="text-sm text-white/65 max-w-lg">تنها ۵۰ عدد از این کالکشن دست‌دوز و عطر کلکسیونی با شماره‌سریال اختصاصی عرضه می‌شود.</p>

      <div className="grid grid-cols-4 gap-4 max-w-md w-full">
        {[
          { val: timeLeft.days, label: "روز" },
          { val: timeLeft.hours, label: "ساعت" },
          { val: timeLeft.mins, label: "دقیقه" },
          { val: timeLeft.secs, label: "ثانیه" },
        ].map((t, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-3xl font-black text-goldLight">{t.val.toLocaleString("fa-IR")}</p>
            <p className="text-[11px] text-white/60 mt-1">{t.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
