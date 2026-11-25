import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const bookings = await prisma.conciergeBooking.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ bookings: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, topic, preferredAt } = await req.json();
    if (!fullName || !phone || !preferredAt || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "تمام فیلدها و شماره موبایل معتبر را وارد کنید" }, { status: 400 });
    }
    const booking = await prisma.conciergeBooking.create({
      data: { fullName, phone, topic: topic || "استایل رسمی", preferredAt },
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت رزرو" }, { status: 500 });
  }
}
