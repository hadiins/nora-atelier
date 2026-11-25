import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, variant, phone } = await req.json();
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }
    const alert = await prisma.stockAlert.create({
      data: { productId, variant: variant || "استاندارد", phone },
    });
    return NextResponse.json({ alert }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت درخواست" }, { status: 500 });
  }
}
