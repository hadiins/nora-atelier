import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import AiStylistWidget from "@/components/AiStylistWidget";
import { getFeatureFlagsMap } from "@/lib/features";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    manifest: "/manifest.json",
  };
}

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
