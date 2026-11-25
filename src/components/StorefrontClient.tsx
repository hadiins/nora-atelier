"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Heart, X, Sparkles } from "lucide-react";
import { ProductDTO, CategoryType } from "@/types/store";
import { useCartStore } from "@/store/cartStore";

const formatPrice = (num: number) => `${num.toLocaleString("fa-IR")} تومان`;

export default function StorefrontClient({ initialProducts }: { initialProducts: ProductDTO[] }) {
  const [category, setCategory] = useState<CategoryType>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [promoInput, setPromoInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const { items, isCartOpen, toggleCart, addItem, updateQty, applyPromo, promoCode, discountPct, clearCart } =
    useCartStore();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const filteredProducts = useMemo(() => {
    const list = initialProducts.filter((p) => {
      const matchCat = category === "ALL" || p.category === category;
      const matchSearch = p.name.includes(search) || p.description.includes(search);
      return matchCat && matchSearch;
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [initialProducts, category, search, sort]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (items.length === 0) return showToast("سبد خرید خالی است.");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "مشتری آتلیه نورا",
          phone: "09120000000",
          address: "تهران، خیابان فرشته",
          postalCode: "1964900000",
          promoCode,
          items: items.map((i) => ({
            productId: i.productId,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const { order } = await res.json();
      clearCart();
      toggleCart();
      showToast(`سفارش ${order.orderNumber} با موفقیت در دیتابیس ثبت شد!`);
    } catch {
      showToast("خطا در ثبت سفارش. لطفاً اتصال دیتابیس را بررسی کنید.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement */}
      <div className="bg-obsidian text-cream text-xs py-2.5 px-4 text-center border-b border-white/10">
        <span>ارسال اکسپرس رایگان برای سفارش‌های بالای ۳,۰۰۰,۰۰۰ تومان</span>
        <span className="mx-2 text-goldLight">•</span>
        <span>کد تخفیف ۲۰٪: <strong className="text-goldLight">LUX20</strong></span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-charcoal text-cream flex items-center justify-center font-black text-lg">ن</div>
            <div>
              <span className="text-xl font-black block leading-none">آتلیه نورا</span>
              <span className="text-[10px] text-muted tracking-[0.2em] uppercase">NORA ATELIER</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {[
              { id: "ALL", label: "همه محصولات" },
              { id: "WOMEN", label: "زنانه" },
              { id: "MEN", label: "مردانه" },
              { id: "KIDS", label: "بچه‌گانه" },
              { id: "PERFUME", label: "عطر و ادکلن" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id as CategoryType)}
                className={`transition hover:text-gold ${category === tab.id ? "text-gold font-bold" : ""}`}
              >
                {tab.label}
              </button>
            ))}
            <Link href="/admin" className="text-xs bg-sand px-3 py-1.5 rounded-full hover:bg-black/10 transition">
              پنل مدیریت
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی لباس یا عطر..."
                className="w-48 md:w-56 bg-sand rounded-full py-2 pr-9 pl-4 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Search className="w-4 h-4 text-muted absolute right-3 top-2.5" />
            </div>

            <button
              onClick={toggleCart}
              className="flex items-center gap-2 bg-charcoal text-cream px-4 py-2.5 rounded-full text-xs font-bold hover:bg-gold transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سبد خرید</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                {items.reduce((s, i) => s + i.quantity, 0).toLocaleString("fa-IR")}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-sand py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs border border-black/5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>معماری اختصاصی Next.js + PostgreSQL (بدون ووکامرس)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2]">
              ظرافت در طراحی،<br />
              <span className="text-gold">امضای یک رایحه خاص</span>
            </h1>
            <p className="text-muted text-base sm:text-lg max-w-xl leading-relaxed">
              کالکشن کامل پوشاک زنانه، مردانه، بچه‌گانه و عطرهای نیش اورجینال با سرعت بارگذاری آنی و پنل مدیریت اختصاصی.
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80"
              alt="مد زنانه"
              className="rounded-3xl aspect-[3/4] object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80"
              alt="عطر لوکس"
              className="rounded-3xl aspect-[3/4] object-cover shadow-xl mt-8"
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(["ALL", "WOMEN", "MEN", "KIDS", "PERFUME"] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  category === cat ? "bg-charcoal text-cream" : "bg-sand text-charcoal hover:bg-black/10"
                }`}
              >
                {cat === "ALL" ? "همه" : cat === "WOMEN" ? "زنانه" : cat === "MEN" ? "مردانه" : cat === "KIDS" ? "بچه‌گانه" : "عطر و ادکلن"}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-black/10 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <option value="featured">پیشنهاد ویژه</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
            <option value="rating">محبوب‌ترین</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div
                onClick={() => {
                  setSelectedProduct(p);
                  setSelectedVariant(p.variants[0]?.label || "استاندارد");
                }}
                className="relative aspect-[4/5] bg-sand overflow-hidden cursor-pointer"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                {p.badge && (
                  <span className="absolute top-3 right-3 bg-obsidian/90 text-cream text-[10px] font-bold px-3 py-1 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-[11px] text-muted">
                  <span>{p.category}</span>
                  <span className="text-gold font-bold">★ {p.rating.toLocaleString("fa-IR")}</span>
                </div>
                <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-sm">{formatPrice(p.price)}</span>
                  <button
                    onClick={() => {
                      const v = p.variants[0]?.label || "استاندارد";
                      addItem({ productId: p.id, name: p.name, price: p.price, image: p.images[0], variantLabel: v });
                      showToast(`«${p.name}» به سبد خرید اضافه شد.`);
                    }}
                    className="bg-charcoal text-cream text-[11px] px-3.5 py-1.5 rounded-full hover:bg-gold transition"
                  >
                    افزودن
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-[2rem] max-w-3xl w-full overflow-hidden grid md:grid-cols-2 relative shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover aspect-[4/5]" />
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <span className="text-xs font-bold text-gold">{selectedProduct.category}</span>
                <h3 className="text-2xl font-black">{selectedProduct.name}</h3>
                <p className="text-xl font-black">{formatPrice(selectedProduct.price)}</p>
                <p className="text-xs text-muted leading-relaxed">{selectedProduct.description}</p>
                {selectedProduct.perfumeNote && (
                  <div className="bg-sand p-3 rounded-2xl text-xs space-y-1">
                    <p><strong>نت اولیه:</strong> {selectedProduct.perfumeNote.topNotes}</p>
                    <p><strong>نت میانی:</strong> {selectedProduct.perfumeNote.midNotes}</p>
                    <p><strong>نت پایه:</strong> {selectedProduct.perfumeNote.baseNotes}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.label)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border ${
                        selectedVariant === v.label ? "bg-charcoal text-cream border-charcoal" : "bg-white border-black/15"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  addItem({
                    productId: selectedProduct.id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    image: selectedProduct.images[0],
                    variantLabel: selectedVariant,
                  });
                  setSelectedProduct(null);
                  showToast("به سبد خرید اضافه شد.");
                }}
                className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition"
              >
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div onClick={toggleCart} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col justify-between">
            <div className="p-6 border-b border-black/10 flex items-center justify-between">
              <h3 className="text-lg font-black">سبد خرید</h3>
              <button onClick={toggleCart} className="p-2"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-muted text-sm py-16">سبد خرید خالی است.</p>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantLabel}`} className="flex gap-3 bg-white p-3 rounded-2xl border border-black/5">
                    <img src={item.image} alt={item.name} className="w-16 h-20 rounded-xl object-cover" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold">{item.name}</h4>
                        <span className="text-[11px] text-muted">{item.variantLabel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gold">{formatPrice(item.price * item.quantity)}</span>
                        <div className="flex items-center gap-2 bg-sand rounded-full px-2.5 py-0.5 text-xs">
                          <button onClick={() => updateQty(item.productId, item.variantLabel, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, item.variantLabel, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-black/10 bg-sand/70 space-y-4">
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="کد تخفیف (LUX20)"
                  className="flex-1 bg-white border border-black/10 rounded-full px-4 py-2 text-xs"
                />
                <button
                  onClick={() => {
                    if (promoInput.trim().toUpperCase() === "LUX20") {
                      applyPromo("LUX20", 20);
                      showToast("کد تخفیف ۲۰٪ اعمال شد!");
                    } else showToast("کد معتبر نیست.");
                  }}
                  className="bg-charcoal text-cream px-4 py-2 rounded-full text-xs font-bold"
                >
                  اعمال
                </button>
              </div>
              <div className="flex justify-between text-base font-black">
                <span>قابل پرداخت:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition"
              >
                ثبت سفارش و پرداخت
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-obsidian text-cream px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}
