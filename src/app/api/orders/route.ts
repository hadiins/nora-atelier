import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { isAdminAuthorized } from "@/lib/adminGuard";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "خطا در دریافت سفارش‌ها" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(`order:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است" }, { status: 429 });
    }

    const body = await req.json();
    const { customerName, phone, address, postalCode, items, promoCode, isGiftWrap, giftMessage } = body;

    if (!customerName || !phone || !address || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "اطلاعات گیرنده یا شماره موبایل نامعتبر است" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 30) {
      return NextResponse.json({ error: "سبد خرید نامعتبر است" }, { status: 400 });
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    let subtotal = 0;
    const orderItemsData: { productId: string; variantName: string; quantity: number; unitPrice: number }[] = [];

    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        return NextResponse.json({ error: "تعداد محصول باید عدد صحیح بین ۱ تا ۲۰ باشد" }, { status: 400 });
      }
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({ error: "محصول یافت نشد" }, { status: 400 });
      }
      const variantObj = prod.variants.find((v) => v.label === item.variantLabel);
      if (variantObj && variantObj.stock < qty) {
        return NextResponse.json({ error: `موجودی ${prod.name} (${variantObj.label}) کافی نیست` }, { status: 400 });
      }

      const unitPrice = variantObj?.price ?? prod.price;
      subtotal += unitPrice * qty;
      orderItemsData.push({
        productId: prod.id,
        variantName: item.variantLabel || "استاندارد",
        quantity: qty,
        unitPrice,
      });
    }

    let discount = 0;
    if (promoCode && typeof promoCode === "string") {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode.trim().toUpperCase() } });
      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
        discount = Math.round((subtotal * promo.discountPct) / 100);
      }
    }

    const giftWrapFee = isGiftWrap ? 120000 : 0;
    const totalAmount = Math.max(0, subtotal - discount + giftWrapFee);
    const orderNumber = `NORA-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: String(customerName).slice(0, 100),
        phone,
        address: String(address).slice(0, 400),
        postalCode: String(postalCode || "").slice(0, 12),
        subtotal,
        discount,
        giftWrapFee,
        totalAmount,
        promoCode: promoCode ? String(promoCode).toUpperCase() : null,
        isGiftWrap: Boolean(isGiftWrap),
        giftMessage: giftMessage ? String(giftMessage).slice(0, 300) : null,
        items: { create: orderItemsData },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "خطا در ثبت سفارش" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const { orderId, status, trackingCode } = await req.json();
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(trackingCode !== undefined ? { trackingCode } : {}),
      },
    });
    if (trackingCode && order.phone) {
      if (process.env.KAVENEGAR_API_KEY) {
        await fetch(`https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/verify/lookup.json?receptor=${order.phone}&token=${trackingCode}&template=tracking`).catch(() => {});
      } else {
        console.log(`📦 [SMS TRACKING] To: ${order.phone} | Order: ${order.orderNumber} | Tracking: ${trackingCode}`);
      }
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "خطا در به‌روزرسانی سفارش" }, { status: 500 });
  }
}
