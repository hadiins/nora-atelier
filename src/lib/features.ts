import { prisma } from "@/lib/prisma";

export interface FeatureDefinition {
  key: string;
  label: string;
  category: string;
  description: string;
  isEnabled: boolean;
}

export const DEFAULT_FEATURES: FeatureDefinition[] = [
  // ۱. هوش مصنوعی و تجربه بصری
  { key: "ai_stylist", label: "مشاور هوشمند استایل و عطر (AI)", category: "هوش مصنوعی و پرو مجازی", description: "نمایش ویجت چت هوشمند در تمام صفحات سایت", isEnabled: true },
  { key: "virtual_try_on", label: "پرو مجازی لباس با هوش مصنوعی", category: "هوش مصنوعی و پرو مجازی", description: "امکان آپلود عکس و مشاهده تن‌خور لباس روی اندام مشتری", isEnabled: true },

  // ۲. امکانات تخصصی پوشاک
  { key: "size_finder", label: "راهنمای سایز هوشمند", category: "امکانات تخصصی پوشاک", description: "محاسبه خودکار سایز بر اساس قد و وزن", isEnabled: true },
  { key: "stock_alert", label: "اطلاع‌رسانی پیامکی موجودی", category: "امکانات تخصصی پوشاک", description: "ثبت شماره موبایل برای کالاهای ناموجود", isEnabled: true },

  // ۳. امکانات تخصصی عطر و ادکلن
  { key: "perfume_compare", label: "مقایسه‌گر تخصصی عطرها", category: "امکانات تخصصی عطر", description: "فعال‌سازی صفحه مقایسه عطرها (/compare)", isEnabled: true },
  { key: "perfume_decant", label: "فروش سمپل و دکانت عطر", category: "امکانات تخصصی عطر", description: "نمایش حجم‌های دکانت ۲ میل و ۵ میل", isEnabled: true },
  { key: "scent_pyramid", label: "هرم تعاملی نت‌های بویایی", category: "امکانات تخصصی عطر", description: "نمایش هرم ۳ لایه نت‌های عطر در صفحه محصول", isEnabled: true },
  { key: "scent_club", label: "باشگاه اشتراک ماهانه عطر", category: "امکانات تخصصی عطر", description: "فعال‌سازی صفحه اشتراک ماهانه عطر (/scent-club)", isEnabled: true },

  // ۴. هدیه و باشگاه مشتریان
  { key: "gift_box_builder", label: "سازنده جعبه هدیه سفارشی", category: "هدیه و باشگاه مشتریان", description: "صفحه ساخت باکس هدیه دلخواه (/gift-box)", isEnabled: true },
  { key: "gift_wrap", label: "کادوپیچ لوکس و کارت تبریک", category: "هدیه و باشگاه مشتریان", description: "گزینه بسته‌بندی هدیه در صفحه تسویه حساب", isEnabled: true },
  { key: "gift_cards", label: "کارت هدیه دیجیتال", category: "هدیه و باشگاه مشتریان", description: "امکان خرید و استفاده از کارت هدیه", isEnabled: true },
  { key: "loyalty_vip", label: "باشگاه مشتریان و امتیاز VIP", category: "هدیه و باشگاه مشتریان", description: "امتیازدهی، سطح‌بندی و کد معرفی دوستان", isEnabled: true },

  // ۵. فروش ویژه و خدمات VIP
  { key: "concierge_video", label: "مشاوره ویدیویی خصوصی (VIP)", category: "فروش ویژه و مشاوره", description: "رزرو وقت مشاوره ویدیویی (/concierge)", isEnabled: true },
  { key: "limited_drops", label: "دراپ کالکشن‌های محدود", category: "فروش ویژه و مشاوره", description: "صفحه شمارش معکوس کالکشن‌های محدود (/drops)", isEnabled: true },

  // ۶. مالی، احراز هویت و سیستم
  { key: "bnpl_payment", label: "پرداخت اقساطی (BNPL)", category: "مالی و سیستم", description: "امکان پرداخت ۴ قسطه در صفحه تسویه حساب", isEnabled: true },
  { key: "otp_login", label: "ورود پیامکی (OTP)", category: "مالی و سیستم", description: "احراز هویت با شماره موبایل و کد پیامکی", isEnabled: true },
  { key: "pwa_mode", label: "نصب اپلیکیشن وب (PWA)", category: "مالی و سیستم", description: "پشتیبانی از نصب روی موبایل و آفلاین", isEnabled: true },
];

export async function getFeatureFlagsMap(): Promise<Record<string, boolean>> {
  const map: Record<string, boolean> = {};
  DEFAULT_FEATURES.forEach((f) => (map[f.key] = f.isEnabled));

  try {
    const dbFlags = await prisma.featureFlag.findMany();
    dbFlags.forEach((f) => {
      map[f.key] = f.isEnabled;
    });
  } catch {
    // fallback به مقادیر پیش‌فرض در صورت نبود اتصال دیتابیس
  }
  return map;
}
