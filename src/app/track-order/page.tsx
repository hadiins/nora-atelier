"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TrackedOrder {
  orderNumber: string;
  status: string;
  totalAmount: number;
  trackingCode?: string | null;
  shippingMethod: string;
  items: { id: string; variantName: string; quantity: number; product: { name: string } }[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) setOrder(data.order);
    else setError(data.error || "سفارش پیدا نشد.");
  };

  const statusLabels: Record<string, string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده (در صف پردازش)",
    PROCESSING: "در حال بسته‌بندی در آتلیه",
    SHIPPED: "تحویل به پست / پیک",
    DELIVERED: "تحویل داده شده به مشتری",
    CANCELLED: "لغو شده",
  };

  return (
    <div className="min-h-screen bg-sand py-14 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-[2rem] p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black">پیگیری لحظه‌ای سفارش</h1>
          <Link href="/" className="text-xs text-muted hover:text-charcoal">بازگشت به فروشگاه</Link>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <input required dir="ltr" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="شماره سفارش (مثلاً NORA-123456)" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />
          <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل ثبت‌شده (0912...)" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />
          <button disabled={loading} className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
            {loading ? "در حال جستجو..." : "استعلام وضعیت سفارش"}
          </button>
        </form>

        {error && <p className="text-xs text-rose-600 font-bold text-center">{error}</p>}

        {order && (
          <div className="bg-sand/70 p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between font-black text-sm">
              <span>سفارش {order.orderNumber}</span>
              <span className="text-gold">{statusLabels[order.status] || order.status}</span>
            </div>
            {order.trackingCode && (
              <p className="bg-emerald-50 text-emerald-800 p-3 rounded-xl font-bold">
                کد رهگیری مرسوله: {order.trackingCode}
              </p>
            )}
            <div className="border-t border-black/10 pt-2 space-y-1">
              {order.items.map((it) => (
                <p key={it.id}>• {it.product.name} ({it.variantName}) × {it.quantity}</p>
              ))}
            </div>
            <p className="font-black pt-1">مبلغ کل: {order.totalAmount.toLocaleString("fa-IR")} تومان</p>
          </div>
        )}
      </div>
    </div>
  );
}
