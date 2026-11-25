import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "سوال نامعتبر است" }, { status: 400 });
    }

    const q = query.toLowerCase();
    const products = await prisma.product.findMany({
      include: { perfumeNote: true },
      take: 20,
    });

    // پیشنهاد هوشمند بر اساس کلمات کلیدی (و قابل اتصال مستقیم به OpenAI با OPENAI_API_KEY)
    const matched = products.filter((p) => {
      if (q.includes("عطر") || q.includes("رایحه") || q.includes("ادکلن") || q.includes("مهمانی")) {
        return p.category === "PERFUME" || p.category === "MEN" || p.category === "WOMEN";
      }
      if (q.includes("بچه") || q.includes("کودک") || q.includes("تولد")) return p.category === "KIDS";
      if (q.includes("مرد") || q.includes("کت")) return p.category === "MEN";
      if (q.includes("زن") || q.includes("پالتو") || q.includes("شومیز")) return p.category === "WOMEN";
      return true;
    }).slice(0, 3);

    const reply =
      matched.length > 0
        ? `بر اساس سلیقه شما («${query}»)، این آثار اختصاصی از کالکشن آتلیه نورا را پیشنهاد می‌کنم:`
        : "در حال حاضر محصول دقیقی یافت نشد، اما پرفروش‌ترین آثار ما را برای شما آماده کرده‌ام:";

    return NextResponse.json({ reply, suggestions: matched });
  } catch {
    return NextResponse.json({ error: "خطا در مشاور هوشمند" }, { status: 500 });
  }
}
