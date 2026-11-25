"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProductDTO } from "@/types/store";
import { useCartStore } from "@/store/cartStore";

const BOX_TYPES = [
  { id: "velvet-black", name: "جعبه مخملی مشکی طلاکوب", price: 350000 },
  { id: "walnut-wood", name: "جعبه چوب گردو دست‌ساز", price: 580000 },
  { id: "cream-ribbon", name: "جعبه کرم با روبان ابریشمی", price: 240000 },
];

export default function GiftBoxBuilderPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [selectedBox, setSelectedBox] = useState(BOX_TYPES[0]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [cardNote, setCardNote] = useState("");
  const { addItem, toggleCart } = useCartStore();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const toggleProduct = (id: string) => {
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  };

  const pickedProducts = products.filter((p) => pickedIds.includes(p.id));
  const itemsSum = pickedProducts.reduce((s, p) => s + p.price, 0);
  const bundleDiscount = pickedProducts.length >= 2 ? Math.round(itemsSum * 0.1) : 0;
  const total = selectedBox.price + itemsSum - bundleDiscount;

  const handleAddBoxToCart = () => {
    pickedProducts.forEach((p) => {
      addItem({
        productId: p.id,
        name: `[باکس هدیه] ${p.name}`,
        price: p.price,
        image: p.images[0],
        variantLabel: selectedBox.name,
      });
    });
    toggleCart();
  };

  return (
    <div className="min-h-screen bg-sand py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gold">تجربه هدیه‌دهی لوکس</span>
            <h1 className="text-3xl font-black mt-1">سازنده جعبه هدیه اختصاصی</h1>
          </div>
          <Link href="/" className="bg-charcoal text-cream px-5 py-2.5 rounded-full text-xs font-bold">بازگشت</Link>
        </div>

        <div className="bg-white p-6 rounded-3xl space-y-4">
          <h2 className="font-bold text-base">۱. انتخاب نوع جعبه هدیه</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {BOX_TYPES.map((box) => (
              <button
                key={box.id}
                onClick={() => setSelectedBox(box)}
                className={`p-4 rounded-2xl border text-right transition ${
                  selectedBox.id === box.id ? "border-gold bg-gold/10 font-bold" : "border-black/10"
                }`}
              >
                <p className="text-sm">{box.name}</p>
                <p className="text-xs text-gold mt-1">{box.price.toLocaleString("fa-IR")} تومان</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl space-y-4">
          <h2 className="font-bold text-base">۲. انتخاب ۲ تا ۴ محصول برای داخل جعبه (۱۰٪ تخفیف پکیج)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.map((p) => {
              const active = pickedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`cursor-pointer rounded-2xl p-3 border transition ${
                    active ? "border-gold bg-gold/5 ring-2 ring-gold" : "border-black/10"
                  }`}
                >
                  <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-xl mb-2" />
                  <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                  <p className="text-[11px] text-gold font-bold mt-1">{p.price.toLocaleString("fa-IR")} ت</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-obsidian text-cream p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 flex-1 w-full">
            <input
              value={cardNote}
              onChange={(e) => setCardNote(e.target.value)}
              placeholder="متن کارت تبریک دست‌نویس داخل جعبه..."
              className="w-full bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-xs text-white"
            />
            <p className="text-xs text-white/70 pt-1">
              مبلغ نهایی با تخفیف پکیج: <strong className="text-goldLight text-base">{total.toLocaleString("fa-IR")} تومان</strong>
            </p>
          </div>
          <button
            disabled={pickedProducts.length === 0}
            onClick={handleAddBoxToCart}
            className="bg-goldLight text-obsidian px-8 py-3.5 rounded-full text-sm font-black hover:bg-white transition disabled:opacity-40"
          >
            افزودن باکس به سبد خرید
          </button>
        </div>
      </div>
    </div>
  );
}
