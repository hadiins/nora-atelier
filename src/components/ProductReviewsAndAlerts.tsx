"use client";

import React, { useState } from "react";

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
}

export default function ProductReviewsAndAlerts({
  productId,
  category,
  initialReviews,
  hasOutOfStock,
}: {
  productId: string;
  category: string;
  initialReviews: ReviewItem[];
  hasOutOfStock: boolean;
}) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  const [alertPhone, setAlertPhone] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, authorName, rating, comment }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviewMsg(data.message || "نظر شما ثبت شد.");
      setAuthorName(""); setComment("");
    }
  };

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/stock-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, phone: alertPhone }),
    });
    if (res.ok) {
      setAlertMsg("✅ شماره شما ثبت شد؛ به محض موجود شدن پیامک ارسال می‌شود.");
      setAlertPhone("");
    }
  };

  return (
    <div className="space-y-8 mt-8">
      {/* جدول سایزبندی استاندارد برای پوشاک */}
      {category !== "PERFUME" && (
        <div className="bg-white rounded-3xl p-6 border border-black/5 space-y-3">
          <h3 className="font-black text-base">جدول راهنمای سایز استاندارد (سانتی‌متر)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-sand font-bold">
                  <th className="p-2.5 rounded-r-xl">سایز</th>
                  <th className="p-2.5">دور سینه</th>
                  <th className="p-2.5">دور کمر</th>
                  <th className="p-2.5 rounded-l-xl">قد لباس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr><td className="p-2.5 font-bold">S / 46</td><td>۹۲ - ۹۶</td><td>۷۸ - ۸۲</td><td>۷۰</td></tr>
                <tr><td className="p-2.5 font-bold">M / 48</td><td>۹۶ - ۱۰۰</td><td>۸۲ - ۸۶</td><td>۷۲</td></tr>
                <tr><td className="p-2.5 font-bold">L / 50</td><td>۱۰۰ - ۱۰۶</td><td>۸۶ - ۹۲</td><td>۷۴</td></tr>
                <tr><td className="p-2.5 font-bold">XL / 52</td><td>۱۰۶ - ۱۱۲</td><td>۹۲ - ۹۸</td><td>۷۶</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* اطلاع‌رسانی موجود شدن کالا */}
      {hasOutOfStock && (
        <form onSubmit={submitAlert} className="bg-obsidian text-cream rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs">
            <p className="font-bold text-goldLight">سایز یا حجم مورد نظرتان ناموجود است؟</p>
            <p className="text-white/65 mt-0.5">شماره خود را ثبت کنید تا به محض شارژ مجدد با پیامک مطلع شوید.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input required dir="ltr" value={alertPhone} onChange={(e) => setAlertPhone(e.target.value)} placeholder="09123456789" className="bg-white/10 border border-white/15 rounded-full px-4 py-2 text-xs text-white" />
            <button className="bg-goldLight text-obsidian px-4 py-2 rounded-full text-xs font-black">خبرم کن</button>
          </div>
          {alertMsg && <p className="w-full text-xs text-emerald-400 font-bold">{alertMsg}</p>}
        </form>
      )}

      {/* بخش نظرات خریداران */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-black/5 space-y-4">
          <h3 className="font-black text-base">دیدگاه خریداران ({initialReviews.length})</h3>
          {initialReviews.length === 0 ? (
            <p className="text-xs text-muted">هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!</p>
          ) : (
            <div className="space-y-3">
              {initialReviews.map((rv) => (
                <div key={rv.id} className="bg-sand/70 p-4 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{rv.authorName}</span>
                    <span className="text-gold">★ {rv.rating}</span>
                  </div>
                  <p className="text-muted leading-relaxed">{rv.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submitReview} className="bg-white rounded-3xl p-6 border border-black/5 space-y-3">
          <h3 className="font-black text-base">ثبت دیدگاه و امتیاز</h3>
          <input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="نام شما" className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs">
            <option value={5}>★★★★★ (عالی - ۵)</option>
            <option value={4}>★★★★ (خوب - ۴)</option>
            <option value={3}>★★★ (متوسط - ۳)</option>
          </select>
          <textarea required rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="تجربه خود از کیفیت یا رایحه محصول را بنویسید..." className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
          <button className="w-full bg-charcoal text-cream py-3 rounded-full text-xs font-bold hover:bg-gold transition">ثبت نظر</button>
          {reviewMsg && <p className="text-xs text-emerald-700 font-bold">{reviewMsg}</p>}
        </form>
      </div>
    </div>
  );
}
