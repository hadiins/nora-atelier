import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(`gift:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است" }, { status: 429 });
    }

    const { action, code, amount } = await req.json();

    if (action === "check") {
      const card = await prisma.giftCard.findUnique({ where: { code: String(code || "").toUpperCase() } });
      if (!card || !card.isActive || card.balance <= 0) {
        return NextResponse.json({ error: "کارت هدیه معتبر نیست" }, { status: 404 });
      }
      return NextResponse.json({ balance: card.balance, code: card.code });
    }

    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "صدور کارت هدیه فقط توسط ادمین یا پس از پرداخت مجاز است" }, { status: 401 });
    }

    const newCode = `NORA-GIFT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const card = await prisma.giftCard.create({
      data: { code: newCode, balance: Math.max(100000, Number(amount || 1000000)) },
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در عملیات کارت هدیه" }, { status: 500 });
  }
}
