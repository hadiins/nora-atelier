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

  const [activeTab, setActiveTab] = useState<"settings" | "products" | "promos" | "features" | "orders" | "dashboard">("settings");
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
  const [productMsg, setProductMsg] = useState("");

  // فرم کد تخفیف
  const [promoCode, setPromoCode] = useState("");
  const [promoPct, setPromoPct] = useState("20");

  const loadAdminData = () => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => d.settings && setSettings(d.settings)).catch(() => {});
    fetch("/api/admin/features").then((r) => r.json()).then((d) => setFeatures(d.features || [])).catch(() => {});
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || [])).catch(() => {});
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(() => {});
    fetch("/api/admin/analytics").then((r) => r.json()).then((d) => setAnalytics(d)).catch(() => {});
    fetch("/api/scent-club").then((r) => r.json()).then((d) => setSubsCount((d.subscriptions || []).length)).catch(() => {});
    fetch("/api/concierge").then((r) => r.json()).then((d) => setBookingsCount((d.bookings || []).length)).catch(() => {});
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
        images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80"],
        variants: [{ label: category === "PERFUME" ? "100ml" : "M", sku: `SKU-${Date.now()}`, stock: 10 }],
      }),
    });
    if (res.ok) {
      setProductMsg("✅ محصول جدید اضافه شد.");
      setName(""); setPrice(""); setOldPrice(""); setBadge("");
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
                <label className="font-bold block mb-1">لینک تصویر اصلی هیرو</label>
                <input dir="ltr" value={settings.heroImage} onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })} className="w-full bg-sand rounded-xl px-4 py-2.5" />
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
              <button type="submit" className="w-full bg-charcoal text-cream py-3 rounded-full text-xs font-bold hover:bg-gold transition">ذخیره محصول</button>
              {productMsg && <p className="text-xs font-bold text-emerald-700">{productMsg}</p>}
            </form>

            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-black/5 space-y-4">
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
