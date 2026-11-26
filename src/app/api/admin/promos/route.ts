import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const promos = await prisma.promoCode.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ promos });
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const { code, discountPct } = await req.json();
    const promo = await prisma.promoCode.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountPct: Math.min(90, Math.max(1, Number(discountPct))),
        isActive: true,
      },
    });
    return NextResponse.json({ promo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ایجاد کد تخفیف (ممکن است تکراری باشد)" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const { id, isActive } = await req.json();
  const promo = await prisma.promoCode.update({ where: { id }, data: { isActive: Boolean(isActive) } });
  return NextResponse.json({ promo });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
