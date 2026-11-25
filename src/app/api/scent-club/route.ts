import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subscriptions = await prisma.scentSubscription.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ subscriptions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, scentPref, plan } = await req.json();
    if (!fullName || !phone) return NextResponse.json({ error: "نام و موبایل الزامی است" }, { status: 400 });
    const sub = await prisma.scentSubscription.create({
      data: { fullName, phone, scentPref: scentPref || "woody", plan: plan || "MONTHLY_8ML" },
    });
    return NextResponse.json({ subscription: sub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت اشتراک" }, { status: 500 });
  }
}
