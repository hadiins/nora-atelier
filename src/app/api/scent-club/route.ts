import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const subscriptions = await prisma.scentSubscription.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ subscriptions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, scentPref, plan } = await req.json();
    if (!fullName || !phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "نام و شماره موبایل معتبر الزامی است" }, { status: 400 });
    }
    const sub = await prisma.scentSubscription.create({
      data: { fullName, phone, scentPref: scentPref || "woody", plan: plan || "MONTHLY_8ML" },
    });
    return NextResponse.json({ subscription: sub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت اشتراک" }, { status: 500 });
  }
}
