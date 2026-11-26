import { prisma } from "@/lib/prisma";

export interface SiteSettingsData {
  brandName: string;
  brandSubtitle: string;
  announcementText: string;
  heroTag: string;
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  heroImage: string;
  footerText: string;
  supportPhone: string;
  instagramUrl: string;
  metaTitle: string;
  metaDescription: string;
  enamadCode: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  brandName: "آتلیه نورا",
  brandSubtitle: "NORA ATELIER",
  announcementText: "ارسال اکسپرس رایگان برای سفارش‌های بالای ۳,۰۰۰,۰۰۰ تومان • کد تخفیف ویژه ۲۰٪: LUX20",
  heroTag: "کالکشن اختصاصی پاییز و زمستان ۲۰۲۵",
  heroTitle: "ظرافت در طراحی،",
  heroHighlight: "امضای یک رایحه خاص",
  heroDesc: "از پالتوهای کشمیر دست‌دوز و پوشاک کودک ارگانیک تا کمیاب‌ترین عطرهای نیش دنیا؛ تجربه‌ای فراتر از یک خرید اینترنتی.",
  heroImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85",
  footerText: "© ۲۰۲۵ آتلیه نورا | فروشگاه لوکس پوشاک و عطر (بدون ووکامرس)",
  supportPhone: "021-22000000",
  instagramUrl: "https://instagram.com",
  metaTitle: "آتلیه نورا | فروشگاه لوکس پوشاک و عطر",
  metaDescription: "فروشگاه تخصصی پوشاک زنانه، مردانه، بچه‌گانه و عطرهای اورجینال با ضمانت اصالت",
  enamadCode: "",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = { ...DEFAULT_SITE_SETTINGS } as Record<string, string>;
    rows.forEach((r) => {
      map[r.key] = r.value;
    });
    return map as unknown as SiteSettingsData;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
