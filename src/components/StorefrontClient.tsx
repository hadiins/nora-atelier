"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Heart, X, Sparkles, Ruler, Camera, User } from "lucide-react";
import { ProductDTO, CategoryType } from "@/types/store";
import { useCartStore } from "@/store/cartStore";
import SizeFinderModal from "./SizeFinderModal";
import VirtualTryOnModal from "./VirtualTryOnModal";
import ScentPyramid from "./ScentPyramid";
import { SiteSettingsData } from "@/lib/settings";

const formatPrice = (num: number) => `${num.toLocaleString("fa-IR")} تومان`;

const HERO_SLIDES = [
  {
    tag: "کالکشن اختصاصی پاییز و زمستان ۲۰۲۵",
    title: "ظرافت در طراحی،",
    highlight: "امضای یک رایحه خاص",
    desc: "از پالتوهای کشمیر دست‌دوز و پوشاک کودک ارگانیک تا کمیاب‌ترین عطرهای نیش دنیا؛ تجربه‌ای فراتر از یک خرید اینترنتی.",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85",
    cardTitle: "پالتو کشمیر ایتالیایی",
  },
  {
    tag: "کلکسیون عطرهای نیش و دیزاینر",
    title: "رایحه‌هایی که",
    highlight: "در ذهن ماندگار می‌شوند",
    desc: "تمام عطرها با ضمانت ۱۰۰٪ اصالت، بچ‌کد قابل استعلام و بسته‌بندی هدیه لوکس ارسال می‌شوند.",
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85",
    cardTitle: "دیور ساواج الکسیر",
  },
  {
    tag: "استایل کلاسیک و اسمارت کژوال مردانه",
    title: "دوخت دقیق،",
    highlight: "پارچه‌های ایتالیایی",
    desc: "کت‌های پشمی مرینوس و پیراهن‌های کتان برای آقایانی که به جزئیات اهمیت می‌دهند.",
    img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=85",
    cardTitle: "کت تک پشمی میلانو",
  },
];

export default function StorefrontClient({
  initialProducts,
  flags,
  settings,
}: {
  initialProducts: ProductDTO[];
  flags: Record<string, boolean>;
  settings: SiteSettingsData;
}) {
  const [category, setCategory] = useState<CategoryType>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [heroIdx, setHeroIdx] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [promoInput, setPromoInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSizeFinder, setShowSizeFinder] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [scentType, setScentType] = useState<"woody" | "spicy">("woody");

  const { items, isCartOpen, toggleCart, addItem, updateQty, applyPromo, discountPct } = useCartStore();

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((p) => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    showToast("لیست علاقه‌مندی‌ها به‌روزرسانی شد.");
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
  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      {/* Announcement */}
      <div className="bg-obsidian text-cream text-[11px] sm:text-xs py-2.5 px-4 text-center border-b border-white/10">
        <span>{settings.announcementText}</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-charcoal text-cream flex items-center justify-center font-black text-lg group-hover:bg-gold transition">ن</div>
            <div>
              <span className="text-xl font-black block leading-none">{settings.brandName}</span>
              <span className="text-[10px] text-muted tracking-[0.2em] uppercase">{settings.brandSubtitle}</span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold">
            <button onClick={() => setCategory("ALL")} className="hover:text-gold transition">همه آثار</button>
            <button onClick={() => setCategory("WOMEN")} className="hover:text-gold transition">زنانه</button>
            <button onClick={() => setCategory("MEN")} className="hover:text-gold transition">مردانه</button>
            <button onClick={() => setCategory("KIDS")} className="hover:text-gold transition">بچه‌گانه</button>
            <button onClick={() => setCategory("PERFUME")} className="hover:text-gold transition">عطر و ادکلن</button>
            {flags.gift_box_builder && <Link href="/gift-box" className="text-gold hover:underline">باکس هدیه</Link>}
            {flags.scent_club && <Link href="/scent-club" className="hover:text-gold transition">باشگاه عطر</Link>}
            {flags.perfume_compare && <Link href="/compare" className="hover:text-gold transition">مقایسه عطر</Link>}
            {flags.concierge_video && <Link href="/concierge" className="hover:text-gold transition">مشاوره VIP</Link>}
            {flags.limited_drops && <Link href="/drops" className="text-rose-600 font-bold">دراپ محدود</Link>}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی لباس یا عطر..."
                className="w-44 lg:w-52 bg-sand rounded-full py-2 pr-9 pl-4 text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Search className="w-4 h-4 text-muted absolute right-3 top-2.5" />
            </div>

            {flags.otp_login && (
              <Link href="/login" className="p-2.5 rounded-full hover:bg-black/5 transition" title="ورود / پروفایل">
                <User className="w-4 h-4" />
              </Link>
            )}

            <Link href="/admin" className="hidden sm:inline-block text-[11px] font-bold bg-sand px-3 py-2 rounded-full hover:bg-black/10 transition">
              پنل ادمین
            </Link>

            <button
              onClick={toggleCart}
              className="flex items-center gap-2 bg-charcoal text-cream px-4 py-2.5 rounded-full text-xs font-bold hover:bg-gold transition shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سبد خرید</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                {items.reduce((s, i) => s + i.quantity, 0).toLocaleString("fa-IR")}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="relative overflow-hidden bg-sand py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 rounded-full text-xs border border-black/5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{heroIdx === 0 ? settings.heroTag : slide.tag}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2]">
              {heroIdx === 0 ? settings.heroTitle : slide.title}<br />
              <span className="text-gold">{heroIdx === 0 ? settings.heroHighlight : slide.highlight}</span>
            </h1>
            <p className="text-muted text-base sm:text-lg max-w-xl leading-relaxed">{heroIdx === 0 ? settings.heroDesc : slide.desc}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#catalog" className="bg-charcoal text-cream px-7 py-3.5 rounded-full text-sm font-bold hover:bg-gold transition shadow-xl">
                ورود به گالری محصولات
              </a>
              {flags.gift_box_builder && (
                <Link href="/gift-box" className="bg-white text-charcoal border border-black/10 px-6 py-3.5 rounded-full text-sm font-bold hover:border-gold hover:text-gold transition">
                  ساخت باکس هدیه
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${heroIdx === idx ? "w-8 bg-charcoal" : "w-3 bg-black/20"}`}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-7 rounded-[2rem] overflow-hidden aspect-[3/4] shadow-2xl bg-white relative">
              <img src={heroIdx === 0 ? settings.heroImage : slide.img} alt={slide.cardTitle} className="w-full h-full object-cover transition duration-700" />
              <div className="absolute bottom-4 right-4 left-4 bg-cream/85 backdrop-blur p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted">انتخاب سردبیر مد</p>
                  <p className="text-xs font-black">{slide.cardTitle}</p>
                </div>
                <a href="#catalog" className="bg-charcoal text-cream text-[11px] px-3.5 py-1.5 rounded-full font-bold">مشاهده</a>
              </div>
            </div>
            <div className="col-span-5 space-y-4">
              <div className="rounded-[2rem] overflow-hidden aspect-square shadow-xl bg-obsidian">
                <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80" alt="عطر" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-black/5">
                <p className="text-xl font-black text-gold">۱۰۰٪</p>
                <p className="text-xs font-bold">تضمین اصالت با بچ‌کد</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      <div className="bg-obsidian text-goldLight py-3.5 overflow-hidden border-y border-white/10">
        <div className="marquee-track flex items-center gap-12 text-xs sm:text-sm font-bold tracking-[0.25em] uppercase whitespace-nowrap">
          <span>TOM FORD</span><span>•</span><span>MASSIMO DUTTI</span><span>•</span><span>CHRISTIAN DIOR</span><span>•</span>
          <span>CREED AVENTUS</span><span>•</span><span>BURBERRY</span><span>•</span><span>JO MALONE</span><span>•</span>
          <span>TOM FORD</span><span>•</span><span>MASSIMO DUTTI</span><span>•</span><span>CHRISTIAN DIOR</span><span>•</span>
          <span>CREED AVENTUS</span><span>•</span><span>BURBERRY</span><span>•</span><span>JO MALONE</span>
        </div>
      </div>

      {/* Bento Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { cat: "WOMEN", title: "پوشاک زنانه", sub: "ظرافت و مدرنیته", img: "https://images.unsplash.com/photo-1483985988635-76728e1935b8?auto=format&fit=crop&w=700&q=80" },
            { cat: "MEN", title: "پوشاک مردانه", sub: "کلاسیک و کژوال", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80" },
            { cat: "KIDS", title: "پوشاک بچه‌گانه", sub: "نخ پنبه ارگانیک", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80" },
            { cat: "PERFUME", title: "عطر و ادکلن", sub: "نیش و دیزاینر اورجینال", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80" },
          ].map((b) => (
            <div
              key={b.cat}
              onClick={() => {
                setCategory(b.cat as CategoryType);
                document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group cursor-pointer relative rounded-3xl overflow-hidden aspect-[4/5] bg-sand shadow-md"
            >
              <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <span className="text-[11px] text-goldLight font-semibold">{b.sub}</span>
                <h3 className="text-lg sm:text-xl font-black">{b.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(["ALL", "WOMEN", "MEN", "KIDS", "PERFUME"] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                  category === cat ? "bg-charcoal text-cream" : "bg-sand text-charcoal hover:bg-black/10"
                }`}
              >
                {cat === "ALL" ? "همه محصولات" : cat === "WOMEN" ? "زنانه" : cat === "MEN" ? "مردانه" : cat === "KIDS" ? "بچه‌گانه" : "عطر و ادکلن"}
              </button>
            ))}
          </div>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border border-black/10 rounded-full px-4 py-2 text-xs font-semibold">
            <option value="featured">پیشنهاد ویژه</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
            <option value="rating">محبوب‌ترین</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {filteredProducts.map((p) => {
            const wished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                <div
                  onClick={() => {
                    setSelectedProduct(p);
                    setSelectedVariant(p.variants[0]?.label || "استاندارد");
                  }}
                  className="relative aspect-[4/5] bg-sand overflow-hidden cursor-pointer"
                >
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  {p.badge && (
                    <span className="absolute top-3.5 right-3.5 bg-obsidian/90 text-cream text-[10px] font-bold px-3 py-1 rounded-full">{p.badge}</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
                  >
                    <Heart className={`w-4 h-4 ${wished ? "fill-rose-500 text-rose-500" : "text-charcoal"}`} />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{p.category}</span>
                    <span className="text-gold font-bold">★ {p.rating.toLocaleString("fa-IR")}</span>
                  </div>
                  <Link href={`/products/${p.slug}`} className="font-bold text-sm hover:text-gold transition line-clamp-1 block">
                    {p.name}
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">{formatPrice(p.price)}</span>
                      {p.oldPrice && <span className="text-[11px] text-muted line-through">{formatPrice(p.oldPrice)}</span>}
                    </div>
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
            );
          })}
        </div>
      </main>

      {/* Dark Luxury Scent Finder Section */}
      <section className="bg-obsidian text-cream py-16 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-goldLight uppercase tracking-widest">مشاوره هوشمند رایحه</span>
            <h2 className="text-3xl font-black">رایحه امضای خود را کشف کنید</h2>
            <p className="text-sm text-white/65">طبع بویایی مورد علاقه خود را انتخاب کنید تا عطر پیشنهادی آتلیه را ببینید.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setScentType("woody")} className={`px-5 py-3 rounded-2xl text-xs font-bold border ${scentType === "woody" ? "border-goldLight bg-goldLight/15 text-goldLight" : "border-white/15"}`}>چوبی و عود</button>
              <button onClick={() => setScentType("spicy")} className={`px-5 py-3 rounded-2xl text-xs font-bold border ${scentType === "spicy" ? "border-goldLight bg-goldLight/15 text-goldLight" : "border-white/15"}`}>ادویه‌ای و کهربا</button>
              {flags.perfume_compare && (
                <Link href="/compare" className="px-5 py-3 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 transition">مقایسه عطرها ←</Link>
              )}
            </div>
          </div>
          <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-5">
            <img
              src={scentType === "woody" ? "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80" : "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80"}
              className="w-28 h-36 rounded-2xl object-cover"
              alt="عطر"
            />
            <div className="space-y-2 text-xs">
              <h3 className="text-lg font-black text-goldLight">{scentType === "woody" ? "تام فورد عود وود (Oud Wood)" : "دیور ساواج الکسیر"}</h3>
              <p className="text-white/70">{scentType === "woody" ? "نت‌های عود کمیاب، صندل، هل و وانیل" : "نت‌های دارچین، جوز هندی، اسطوخودوس و کهربا"}</p>
              <p className="font-bold text-sm">{scentType === "woody" ? "۱۱,۲۰۰,۰۰۰ تومان" : "۸,۹۰۰,۰۰۰ تومان"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-obsidian text-cream pt-12 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <span>{settings.footerText} • پشتیبانی: {settings.supportPhone}</span>
          <div className="flex gap-4">
            {flags.gift_box_builder && <Link href="/gift-box" className="hover:text-goldLight">باکس هدیه</Link>}
            {flags.scent_club && <Link href="/scent-club" className="hover:text-goldLight">باشگاه عطر</Link>}
            {flags.concierge_video && <Link href="/concierge" className="hover:text-goldLight">مشاوره VIP</Link>}
            <Link href="/admin" className="hover:text-goldLight">پنل مدیریت</Link>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cream rounded-[2rem] max-w-3xl w-full overflow-hidden grid md:grid-cols-2 relative shadow-2xl my-8">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
              <X className="w-5 h-5" />
            </button>
            <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover aspect-[4/5]" />
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold text-gold">{selectedProduct.category}</span>
                <h3 className="text-2xl font-black">{selectedProduct.name}</h3>
                <p className="text-xl font-black">{formatPrice(selectedProduct.price)}</p>
                <p className="text-xs text-muted leading-relaxed">{selectedProduct.description}</p>

                {selectedProduct.perfumeNote && flags.scent_pyramid && (
                  <ScentPyramid
                    topNotes={selectedProduct.perfumeNote.topNotes}
                    midNotes={selectedProduct.perfumeNote.midNotes}
                    baseNotes={selectedProduct.perfumeNote.baseNotes}
                  />
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

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedProduct.category !== "PERFUME" && flags.size_finder && (
                    <button onClick={() => setShowSizeFinder(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-gold hover:underline">
                      <Ruler className="w-3.5 h-3.5" /> راهنمای سایز هوشمند
                    </button>
                  )}
                  {selectedProduct.category !== "PERFUME" && flags.virtual_try_on && (
                    <button onClick={() => setTryOnImage(selectedProduct.images[0])} className="flex items-center gap-1.5 text-[11px] font-bold text-charcoal hover:text-gold">
                      <Camera className="w-3.5 h-3.5" /> پرو مجازی لباس
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  addItem({ productId: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, image: selectedProduct.images[0], variantLabel: selectedVariant });
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
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="کد تخفیف (LUX20)" className="flex-1 bg-white border border-black/10 rounded-full px-4 py-2 text-xs" />
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
              <Link href="/checkout" onClick={toggleCart} className="block text-center w-full bg-charcoal text-cream py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
                ادامه و تکمیل خرید
              </Link>
            </div>
          </div>
        </div>
      )}

      {showSizeFinder && <SizeFinderModal onClose={() => setShowSizeFinder(false)} />}
      {tryOnImage && <VirtualTryOnModal garmentImage={tryOnImage} onClose={() => setTryOnImage(null)} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-obsidian text-cream px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold">{toast}</div>}
    </div>
  );
}
