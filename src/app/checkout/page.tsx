"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const { items, promoCode, discountPct, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const giftFee = isGiftWrap ? 120000 : 0;
  const total = subtotal - discount + giftFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return setError("سبد خرید شما خالی است.");
    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          postalCode,
          promoCode,
          isGiftWrap,
          giftMessage,
          items: items.map((i) => ({ productId: i.productId, variantLabel: i.variantLabel, quantity: i.quantity })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "خطا در ثبت سفارش");

      const payRes = await fetch("/api/payment/zarinpal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const payData = await payRes.json();

      if (payRes.ok && payData.url) {
        clearCart();
        window.location.href = payData.url;
      } else {
        setError(`سفارش ${orderData.order.orderNumber} ثبت شد، اما مرچنت‌کد زرین‌پال در .env تنظیم نشده است.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-black/5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black">اطلاعات ارسال و بسته‌بندی</h1>
            <Link href="/" className="text-xs text-muted hover:text-charcoal">بازگشت</Link>
          </div>
          <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="نام و نام خانوادگی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />
          <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس دقیق پستی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm" />
          <input required dir="ltr" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="کد پستی ۱۰ رقمی" className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-right" />

          <div className="bg-sand/70 p-4 rounded-2xl space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={isGiftWrap} onChange={(e) => setIsGiftWrap(e.target.checked)} className="w-4 h-4 accent-gold" />
              <span>بسته‌بندی هدیه لوکس + کارت تبریک اختصاصی (+۱۲۰,۰۰۰ تومان)</span>
            </label>
            {isGiftWrap && (
              <textarea
                rows={2}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="متن دلخواه روی کارت تبریک..."
                className="w-full bg-white rounded-xl px-3 py-2 text-xs"
              />
            )}
          </div>

          <button disabled={loading} className="w-full bg-charcoal text-cream py-4 rounded-full text-sm font-bold hover:bg-gold transition">
            {loading ? "در حال اتصال به درگاه..." : "پرداخت آنلاین (زرین‌پال)"}
          </button>
          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        </form>

        <div className="md:col-span-5 bg-cream p-6 rounded-3xl border border-black/5 h-fit space-y-4">
          <h2 className="font-bold text-base">خلاصه سبد خرید</h2>
          <div className="space-y-2 text-xs">
            {items.map((i) => (
              <div key={`${i.productId}-${i.variantLabel}`} className="flex justify-between">
                <span>{i.name} ({i.variantLabel}) × {i.quantity}</span>
                <span className="font-bold">{(i.price * i.quantity).toLocaleString("fa-IR")} ت</span>
              </div>
            ))}
            {isGiftWrap && (
              <div className="flex justify-between text-gold font-semibold">
                <span>بسته‌بندی هدیه لوکس</span>
                <span>۱۲۰,۰۰۰ ت</span>
              </div>
            )}
          </div>
          <div className="border-t border-black/10 pt-3 flex justify-between font-black text-base">
            <span>قابل پرداخت:</span>
            <span className="text-gold">{total.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </div>
    </div>
  );
}
