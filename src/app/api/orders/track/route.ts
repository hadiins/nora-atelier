import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const phone = searchParams.get("phone")?.trim();

    if (!orderNumber || !phone) {
      return NextResponse.json({ error: "شماره سفارش و شماره موبایل الزامی است" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber, phone },
      select: {
        orderNumber: true,
        status: true,
        totalAmount: true,
        trackingCode: true,
        shippingMethod: true,
        createdAt: true,
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارشی با این مشخصات یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "خطا در جستجوی سفارش" }, { status: 500 });
  }
}
