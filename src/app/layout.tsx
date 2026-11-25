import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import AiStylistWidget from "@/components/AiStylistWidget";
import { getFeatureFlagsMap } from "@/lib/features";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "آتلیه نورا | فروشگاه لوکس پوشاک و عطر",
  description: "فروشگاه تخصصی پوشاک زنانه، مردانه، بچه‌گانه و عطرهای اورجینال",
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getFeatureFlagsMap();

  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.className} antialiased selection:bg-gold selection:text-white`}>
        {children}
        {flags.ai_stylist && <AiStylistWidget />}
      </body>
    </html>
  );
}
