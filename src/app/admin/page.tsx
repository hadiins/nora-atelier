"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface FeatureFlagItem {
  key: string;
  label: string;
  category: string;
  description: string;
  isEnabled: boolean;
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "features">("features");
  const [features, setFeatures] = useState<FeatureFlagItem[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ totalOrders: 0, totalRevenue: 0, lowStockCount: 0 });
  const [subsCount, setSubsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  // فرم محصول جدید
  const [name, setName] = useState("");
  const [category, setCategory] = useState("WOMEN");
  const [price, setPrice] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/features").then((r) => r.json()).then((d) => setFeatures(d.features || [])).catch(() => {});
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(() => {});
    fetch("/api/admin/analytics").then((r) => r.json()).then((d) => setAnalytics(d)).catch(() => {});
    fetch("/api/scent-club").then((r) => r.json()).then((d) => setSubsCount((d.subscriptions || []).length)).catch(() => {});
    fetch("/api/concierge").then((r) => r.json()).then((d) => setBookingsCount((d.bookings || []).length)).catch(() => {});
  }, []);

  const toggleFeature = async (key: string, current: boolean) => {
    const next = !current;
    setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: next } : f)));
    await fetch("/api/admin/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
      body: JSON.stringify({ key, isEnabled: next }),
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
      body: JSON.stringify({
        slug: `product-${Date.now()}`,
        name,
        description: "توضیحات محصول اختصاصی آتلیه نورا",
        category,
        price: Number(price),
        images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80"],
        variants: [{ label: category === "PERFUME" ? "100ml" : "M", sku: `SKU-${Date.now()}`, stock: 10 }],
      }),
    });
    if (res.ok) {
      setMessage("✅ محصول با موفقیت در دیتابیس ذخیره شد.");
      setName("");
      setPrice("");
    } else {
      setMessage("❌ خطا: کلید امنیتی ادمین یا اتصال دیتابیس را بررسی کنید.");
    }
  };

  // دسته‌بندی کردن فیچرها برای نمایش منظم
  const groupedFeatures = features.reduce<Record<string, FeatureFlagItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-sand p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="bg-obsidian text-cream p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black">پنل مدیریت جامع آتلیه نورا</h1>
            <p className="text-xs text-white/60 mt-1">مدیریت دسته‌بندی‌شده محصولات، سفارش‌ها و فعال/غیرفعال‌سازی امکانات سایت</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/api/admin/analytics?format=csv" className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20 transition">
              خروجی اکسل سفارش‌ها
            </a>
            <Link href="/" className="bg-goldLight text-obsidian px-5 py-2 rounded-full text-xs font-black hover:bg-white transition">
              مشاهده فروشگاه
            </Link>
          </div>
        </div>

        {/* Categorized Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "features", label: "🎛️ کنترل امکانات سایت (Feature Flags)" },
            { id: "dashboard", label: "📊 داشبورد و آمار" },
            { id: "products", label: "👗 محصولات و انبار" },
            { id: "orders", label: "📦 سفارش‌ها و سرویس‌های VIP" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                activeTab === t.id ? "bg-charcoal text-cream shadow-md" : "bg-white text-charcoal hover:bg-black/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Feature Flags (Categorized) */}
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
                        className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                          feat.isEnabled ? "bg-emerald-600 justify-end" : "bg-black/20 justify-start"
                        }`}
                        title={feat.isEnabled ? "فعال" : "غیرفعال"}
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

        {/* Tab 2: Analytics Dashboard */}
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

        {/* Tab 3: Products */}
        {activeTab === "products" && (
          <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border border-black/5 max-w-xl space-y-4">
            <h2 className="font-bold text-lg">افزودن محصول جدید</h2>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="نام محصول" className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm">
              <option value="WOMEN">پوشاک زنانه</option>
              <option value="MEN">پوشاک مردانه</option>
              <option value="KIDS">پوشاک بچه‌گانه</option>
              <option value="PERFUME">عطر و ادکلن</option>
            </select>
            <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="قیمت به تومان" className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm" />
            <input value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="کلید امنیتی ADMIN_API_SECRET" className="w-full bg-sand rounded-xl px-4 py-2.5 text-sm" />
            <button type="submit" className="w-full bg-charcoal text-cream py-3 rounded-full text-sm font-bold hover:bg-gold transition">
              ذخیره محصول
            </button>
            {message && <p className="text-xs font-bold">{message}</p>}
          </form>
        )}

        {/* Tab 4: Orders */}
        {activeTab === "orders" && (
          <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-4">
            <h2 className="font-bold text-lg">لیست سفارش‌های ثبت‌شده</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-muted">سفارشی ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 bg-sand rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black">{o.orderNumber}</p>
                      <p className="text-muted">{o.customerName}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gold">{o.totalAmount.toLocaleString("fa-IR")} تومان</p>
                      <span className="bg-white px-3 py-0.5 rounded-full text-[10px] font-bold">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
