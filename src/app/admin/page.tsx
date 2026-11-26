"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SiteSettingsData, DEFAULT_SITE_SETTINGS } from "@/lib/settings";

interface FeatureFlagItem {
  key: string;
  label: string;
  category: string;
  description: string;
  isEnabled: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  badge?: string | null;
}

interface PromoItem {
  id: string;
  code: string;
  discountPct: number;
  isActive: boolean;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  trackingCode?: string | null;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

export default function AdminDashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"settings" | "products" | "promos" | "features" | "orders" | "crm" | "dashboard">("settings");
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);
  const [settingsMsg, setSettingsMsg] = useState("");

  const [features, setFeatures] = useState<FeatureFlagItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ totalOrders: 0, totalRevenue: 0, lowStockCount: 0 });
  const [subsCount, setSubsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  // فرم افزودن محصول
  const [name, setName] = useState("");
  const [category, setCategory] = useState("WOMEN");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok && data.url) {
      onSuccess(data.url);
    } else {
      alert(data.error || "خطا در آپلود تصویر");
    }
  };
  const [productMsg, setProductMsg] = useState("");

  // فرم کد تخفیف
  const [promoCode, setPromoCode] = useState("");
  const [promoPct, setPromoPct] = useState("20");
  const [reviews, setReviews] = useState<{ id: string; authorName: string; rating: number; comment: string; isApproved: boolean; product?: { name: string } }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; phone: string; fullName: string | null; tier: string; points: number; _count?: { orders: number } }[]>([]);
  const [bulkCat, setBulkCat] = useState("ALL");
  const [bulkPct, setBulkPct] = useState("20");

  const loadAdminData = () => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => d.settings && setSettings(d.settings)).catch(() => {});
    fetch("/api/admin/features").then((r) => r.json()).then((d) => setFeatures(d.features || [])).catch(() => {});
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || [])).catch(() => {});
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(() => {});
    fetch("/api/admin/analytics").then((r) => r.json()).then((d) => setAnalytics(d)).catch(() => {});
    fetch("/api/scent-club").then((r) => r.json()).then((d) => setSubsCount((d.subscriptions || []).length)).catch(() => {});
    fetch("/api/concierge").then((r) => r.json()).then((d) => setBookingsCount((d.bookings || []).length)).catch(() => {});
    fetch("/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.users || [])).catch(() => {});
  };

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => {
        if (r.ok) {
          setIsAdmin(true);
          loadAdminData();
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsAdmin(true);
      loadAdminData();
    } else {
      setLoginError(data.error || "ورود ناموفق بود");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSettingsMsg(res.ok ? "✅ تمام متن‌ها و تنظیمات سایت ذخیره و منتشر شد!" : "❌ خطا در ذخیره تنظیمات");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductMsg("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: `product-${Date.now()}`,
        name,
        description: "توضیحات محصول اختصاصی آتلیه نورا",
        category,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        badge: badge || null,
        images: productImages.length > 0 ? productImages : ["/uploads/placeholder.jpg"],
        variants: [{ label: category === "PERFUME" ? "100ml" : "M", sku: `SKU-${Date.now()}`, stock: 10 }],
      }),
    });
    if (res.ok) {
      setProductMsg("✅ محصول جدید اضافه شد.");
      setName(""); setPrice(""); setOldPrice(""); setBadge(""); setProductImages([]);
      loadAdminData();
    } else {
      setProductMsg("❌ خطا در ذخیره محصول.");
    }
  };

  const handleUpdateProductDiscount = async (id: string, newPrice: number, newOldPrice: number | null, newBadge: string) => {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price: newPrice, oldPrice: newOldPrice, badge: newBadge }),
    });
    loadAdminData();
    setProductMsg("✅ قیمت و تخفیف محصول به‌روزرسانی شد.");
  };

  const handleDeleteProduct = async (id: string) => {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    loadAdminData();
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, discountPct: Number(promoPct) }),
    });
    if (res.ok) {
      setPromoCode("");
      loadAdminData();
    }
  };

  const toggleFeature = async (key: string, current: boolean) => {
    const next = !current;
    setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: next } : f)));
    await fetch("/api/admin/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, isEnabled: next }),
    });
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingCode: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, trackingCode }),
    });
    loadAdminData();
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-sand flex items-center justify-center text-sm font-bold">در حال بررسی دسترسی...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex items-center justify-center p-4">
        <form onSubmit={handleAdminLogin} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 max-w-md w-full space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-goldLight">ورود به پنل مدیریت</h1>
            <p className="text-xs text-white/60">نام کاربری و کلمه عبور مدیر را وارد کنید</p>
          </div>
          <input required dir="ltr" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username (admin)" className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-3 text-sm text-right" />
          <input required dir="ltr" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (ADMIN_API_SECRET)" className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-3 text-sm text-right" />
          <button className="w-full bg-goldLight text-obsidian py-3.5 rounded-full text-sm font-black hover:bg-white transition">ورود امن به پنل ادمین</button>
          {loginError && <p className="text-xs text-rose-400 text-center font-bold">{loginError}</p>}
          <Link href="/" className="block text-center text-xs text-white/50 hover:text-white">بازگشت به فروشگاه</Link>
        </form>
      </div>
    );
  }

  const groupedFeatures = features.reduce<Record<string, FeatureFlagItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-sand p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-obsidian text-cream p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black">پنل مدیریت جامع آتلیه نورا</h1>
            <p className="text-xs text-white/60 mt-1">کنترل کامل متن‌ها، تخفیفات محصولات، کدهای تخفیف، سفارش‌ها و امکانات سایت</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/admin/analytics?format=csv" className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20 transition">خروجی اکسل</a>
            <a href="/api/admin/backup" className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20 transition">بکاپ کامل (JSON)</a>
            <Link href="/" className="bg-goldLight text-obsidian px-5 py-2 rounded-full text-xs font-black hover:bg-white transition">مشاهده سایت</Link>
            <button onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); setIsAdmin(false); }} className="bg-rose-600/80 text-white px-4 py-2 rounded-full text-xs font-bold">خروج</button>
          </div>
        </div>

        {/* Categorized Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "settings", label: "🎨 تنظیمات متن و ظاهر سایت" },
            { id: "products", label: "👗 محصولات و تخفیفات" },
            { id: "promos", label: "🏷️ کدهای تخفیف" },
            { id: "features", label: "🎛️ کنترل امکانات (۱۷ قابلیت)" },
            { id: "orders", label: "📦 سفارش‌ها و رهگیری" },
            { id: "crm", label: "💬 نظرات و مشتریان" },
            { id: "dashboard", label: "📊 آمار فروش" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition ${
                activeTab === t.id ? "bg-charcoal text-cream shadow-md" : "bg-white text-charcoal hover:bg-black/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: CMS Site Settings */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 space-y-5 shadow-sm">
            <h2 className="font-black text-lg text-gold">ویرایش متن‌ها، بنر بالا، هیرو و فوتر سایت</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold block mb-1">نام برند (فارسی)</label>
                <input value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">زیرعنوان برند (انگلیسی)</label>
                <input dir="ltr" value={settings.brandSubtitle} onChange={(e) => setSettings({ ...settings, brandSubtitle: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">متن نوار اطلاع‌رسانی بالای سایت (Announcement Bar)</label>
                <input value={settings.announcementText} onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">برچسب بالای تیتر (Hero Tag)</label>
                <input value={settings.heroTag} onChange={(e) => setSettings({ ...settings, heroTag: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">تیتر خط اول هیرو</label>
                <input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">تیتر خط دوم (رنگ طلایی)</label>
                <input value={settings.heroHighlight} onChange={(e) => setSettings({ ...settings, heroHighlight: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">تصویر اصلی هیرو (آپلود مستقیم یا آدرس)</label>
                <div className="flex gap-2 items-center">
                  <input dir="ltr" value={settings.heroImage} onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })} className="flex-1 bg-sand rounded-xl px-4 py-2.5" />
                  <label className="cursor-pointer bg-charcoal text-cream px-4 py-2.5 rounded-xl font-bold whitespace-nowrap hover:bg-gold transition">
                    {uploading ? "..." : "آپلود عکس"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], (url) => setSettings({ ...settings, heroImage: url }))} />
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">توضیحات صفحه اصلی (Hero Description)</label>
                <textarea rows={2} value={settings.heroDesc} onChange={(e) => setSettings({ ...settings, heroDesc: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">متن کپی‌رایت فوتر</label>
                <input value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">شماره تماس پشتیبانی</label>
                <input dir="ltr" value={settings.supportPhone} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">عنوان سئو (Meta Title)</label>
                <input value={settings.metaTitle || ""} onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div>
                <label className="font-bold block mb-1">توضیحات سئو (Meta Description)</label>
                <input value={settings.metaDescription || ""} onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">کد HTML نماد اعتماد الکترونیکی (اینماد)</label>
                <textarea dir="ltr" rows={2} value={settings.enamadCode || ""} onChange={(e) => setSettings({ ...settings, enamadCode: e.target.value })} placeholder="<a ...><img .../></a>" className="w-full bg-sand rounded-xl px-4 py-2.5" />
              </div>
            </div>
            <button type="submit" className="bg-charcoal text-cream px-8 py-3.5 rounded-full text-sm font-bold hover:bg-gold transition">
              ذخیره و انتشار تغییرات در سایت
            </button>
            {settingsMsg && <p className="text-xs font-bold text-emerald-700">{settingsMsg}</p>}
          </form>
        )}

        {/* Tab 2: Products & Individual Discounts */}
        {activeTab === "products" && (
          <div className="grid lg:grid-cols-12 gap-6">
            <form onSubmit={handleAddProduct} className="lg:col-span-4 bg-white p-6 rounded-3xl border border-black/5 space-y-3 h-fit">
              <h2 className="font-bold text-base">افزودن محصول جدید</h2>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="نام محصول" className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs">
                <option value="WOMEN">پوشاک زنانه</option>
                <option value="MEN">پوشاک مردانه</option>
                <option value="KIDS">پوشاک بچه‌گانه</option>
                <option value="PERFUME">عطر و ادکلن</option>
              </select>
              <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="قیمت فروش (تومان)" className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
              <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="قیمت قبل از تخفیف (اختیاری)" className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
              <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="نشان محصول (مثلاً ۲۰٪ تخفیف / جدید)" className="w-full bg-sand rounded-xl px-4 py-2.5 text-xs" />
              <div className="space-y-2">
                <label className="block cursor-pointer bg-sand border border-dashed border-black/20 rounded-xl px-4 py-3 text-center text-xs font-bold hover:border-gold transition">
                  {uploading ? "در حال آپلود..." : "+ افزودن یک یا چند تصویر برای محصول"}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const f of files) {
                        await handleFileUpload(f, (url) => setProductImages((prev) => [...prev, url]));
                      }
                    }}
                  />
                </label>
                {productImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {productImages.map((img, i) => (
                      <div key={i} className="relative w-14 h-16 rounded-xl overflow-hidden border border-black/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-charcoal text-cream py-3 rounded-full text-xs font-bold hover:bg-gold transition">ذخیره محصول</button>
              {productMsg && <p className="text-xs font-bold text-emerald-700">{productMsg}</p>}
            </form>

            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-black/5 space-y-4">
              <div className="p-4 rounded-2xl bg-obsidian text-cream flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-goldLight">تخفیف گروهی (کمپین):</span>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={bulkCat} onChange={(e) => setBulkCat(e.target.value)} className="bg-charcoal border border-white/15 rounded-full px-3 py-1.5">
                    <option value="ALL">همه دسته‌ها</option>
                    <option value="WOMEN">زنانه</option>
                    <option value="MEN">مردانه</option>
                    <option value="KIDS">بچه‌گانه</option>
                    <option value="PERFUME">عطر و ادکلن</option>
                  </select>
                  <input type="number" min={0} max={90} value={bulkPct} onChange={(e) => setBulkPct(e.target.value)} className="w-20 bg-charcoal border border-white/15 rounded-full px-3 py-1.5 text-center" />
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/admin/bulk-discount", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: bulkCat, discountPct: Number(bulkPct) }) });
                      loadAdminData();
                      setProductMsg("✅ تخفیف گروهی اعمال شد (عدد ۰ برای لغو تخفیف).");
                    }}
                    className="bg-goldLight text-obsidian px-4 py-1.5 rounded-full font-black"
                  >
                    اعمال ٪
                  </button>
                </div>
              </div>
              <h2 className="font-bold text-base">مدیریت و تخفیف‌گذاری محصولات ({products.length})</h2>
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {products.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-sand/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-black">{p.name}</p>
                      <span className="text-[10px] text-muted">{p.category} • نشان: {p.badge || "ندارد"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const discounted = Math.round(p.price * 0.8);
                          handleUpdateProductDiscount(p.id, discounted, p.price, "۲۰٪ تخفیف");
                        }}
                        className="bg-gold/15 text-gold px-3 py-1.5 rounded-full font-bold hover:bg-gold hover:text-white transition"
                      >
                        اعمال ۲۰٪ تخفیف
                      </button>
                      <button
                        onClick={() => handleUpdateProductDiscount(p.id, p.oldPrice || p.price, null, "")}
                        className="bg-white px-3 py-1.5 rounded-full font-bold border border-black/10"
                      >
                        لغو تخفیف
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full font-bold">
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Promo Codes */}
        {activeTab === "promos" && (
          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={handleAddPromo} className="bg-white p-6 rounded-3xl border border-black/5 space-y-4 h-fit">
              <h2 className="font-bold text-base">ساخت کد تخفیف جدید</h2>
              <input required dir="ltr" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="کد تخفیف (مثلاً YALDA30)" className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm text-right" />
              <input required type="number" min={1} max={90} value={promoPct} onChange={(e) => setPromoPct(e.target.value)} placeholder="درصد تخفیف (۱ تا ۹۰)" className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm" />
              <button className="w-full bg-charcoal text-cream py-3 rounded-full text-xs font-bold hover:bg-gold transition">ایجاد کد تخفیف</button>
            </form>
            <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-3">
              <h2 className="font-bold text-base">کدهای تخفیف فعال</h2>
              {promos.map((pr) => (
                <div key={pr.id} className="p-3 bg-sand rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-sm">{pr.code}</strong>
                    <span className="mx-2 text-gold font-bold">{pr.discountPct}٪ تخفیف</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await fetch("/api/admin/promos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pr.id, isActive: !pr.isActive }) });
                        loadAdminData();
                      }}
                      className={`px-3 py-1 rounded-full font-bold ${pr.isActive ? "bg-emerald-100 text-emerald-700" : "bg-black/10"}`}
                    >
                      {pr.isActive ? "فعال" : "غیرفعال"}
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/promos?id=${pr.id}`, { method: "DELETE" });
                        loadAdminData();
                      }}
                      className="text-rose-600 font-bold px-2"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Feature Flags */}
        {activeTab === "features" && (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(groupedFeatures).map(([catName, list]) => (
              <div key={catName} className="bg-white p-6 rounded-3xl border border-black/5 space-y-4 shadow-sm">
                <h2 className="font-black text-base text-gold border-b border-black/5 pb-3">{catName}</h2>
                <div className="space-y-3">
                  {list.map((feat) => (
                    <div key={feat.key} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-sand/60">
                      <div>
                        <p className="text-xs font-bold">{feat.label}</p>
                        <p className="text-[11px] text-muted mt-0.5">{feat.description}</p>
                      </div>
                      <button
                        onClick={() => toggleFeature(feat.key, feat.isEnabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${feat.isEnabled ? "bg-emerald-600 justify-end" : "bg-black/20 justify-start"}`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow block" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Orders & Tracking */}
        {activeTab === "orders" && (
          <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-4">
            <h2 className="font-bold text-lg">مدیریت سفارش‌ها و ثبت کد رهگیری پست</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-muted">سفارشی ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 bg-sand rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs">
                    <div>
                      <p className="font-black">{o.orderNumber} — {o.customerName}</p>
                      <p className="text-gold font-bold mt-0.5">{o.totalAmount.toLocaleString("fa-IR")} تومان</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value, o.trackingCode || "")}
                        className="bg-white rounded-full px-3 py-1.5 font-bold border border-black/10"
                      >
                        <option value="PENDING">در انتظار پرداخت</option>
                        <option value="PAID">پرداخت شده</option>
                        <option value="PROCESSING">در حال بسته‌بندی</option>
                        <option value="SHIPPED">ارسال شده</option>
                        <option value="DELIVERED">تحویل داده شده</option>
                      </select>
                      <button
                        onClick={() => {
                          const code = prompt("کد رهگیری پست را وارد کنید:", o.trackingCode || "");
                          if (code !== null) updateOrderStatus(o.id, "SHIPPED", code);
                        }}
                        className="bg-charcoal text-cream px-3 py-1.5 rounded-full font-bold"
                      >
                        {o.trackingCode ? `رهگیری: ${o.trackingCode}` : "ثبت کد رهگیری"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: CRM & Reviews */}
        {activeTab === "crm" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-3">
              <h2 className="font-bold text-base">مدیریت نظرات مشتریان ({reviews.length})</h2>
              {reviews.length === 0 ? <p className="text-xs text-muted">هنوز نظری ثبت نشده است.</p> : reviews.map((rv) => (
                <div key={rv.id} className="p-3 bg-sand rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>{rv.authorName} ({rv.product?.name})</span>
                    <span className="text-gold">★ {rv.rating}</span>
                  </div>
                  <p className="text-muted">{rv.comment}</p>
                  <div className="flex gap-2">
                    <button onClick={async () => { await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rv.id, isApproved: !rv.isApproved }) }); loadAdminData(); }} className={`px-3 py-1 rounded-full font-bold ${rv.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-white"}`}>
                      {rv.isApproved ? "تایید شده" : "تایید نمایش"}
                    </button>
                    <button onClick={async () => { await fetch(`/api/reviews?id=${rv.id}`, { method: "DELETE" }); loadAdminData(); }} className="text-rose-600 font-bold px-2">حذف</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-3">
              <h2 className="font-bold text-base">باشگاه مشتریان ({customers.length})</h2>
              {customers.length === 0 ? <p className="text-xs text-muted">هنوز کاربری ثبت‌نام نکرده است.</p> : customers.map((c) => (
                <div key={c.id} className="p-3 bg-sand rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold" dir="ltr">{c.phone}</p>
                    <span className="text-[10px] text-muted">سفارش‌ها: {c._count?.orders || 0} • امتیاز: {c.points}</span>
                  </div>
                  <select
                    value={c.tier}
                    onChange={async (e) => {
                      await fetch("/api/admin/customers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, tier: e.target.value }) });
                      loadAdminData();
                    }}
                    className="bg-white rounded-full px-3 py-1 font-bold border border-black/10"
                  >
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-black/5">
              <p className="text-xs text-muted">درآمد کل</p>
              <p className="text-2xl font-black text-gold mt-1">{(analytics.totalRevenue || 0).toLocaleString("fa-IR")} ت</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-black/5">
              <p className="text-xs text-muted">تعداد کل سفارش‌ها</p>
              <p className="text-2xl font-black mt-1">{(analytics.totalOrders || 0).toLocaleString("fa-IR")}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-black/5">
              <p className="text-xs text-muted">اعضای باشگاه عطر</p>
              <p className="text-2xl font-black mt-1">{subsCount.toLocaleString("fa-IR")}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-black/5">
              <p className="text-xs text-muted">رزروهای مشاوره VIP</p>
              <p className="text-2xl font-black mt-1">{bookingsCount.toLocaleString("fa-IR")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
