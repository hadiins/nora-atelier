import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }

    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://api.zarinpal.com/pg/v4/payment/request.json";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: order.totalAmount * 10, // تبدیل تومان به ریال
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/verify?orderId=${order.id}`,
        description: `پرداخت سفارش ${order.orderNumber} از آتلیه نورا`,
        metadata: { mobile: order.phone },
      }),
    });

    const data = await response.json();
    if (data?.data?.code === 100) {
      const authority = data.data.authority;
      await prisma.order.update({
        where: { id: order.id },
        data: { authority },
      });

      const gatewayUrl = isSandbox
        ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        : `https://www.zarinpal.com/pg/StartPay/${authority}`;

      return NextResponse.json({ url: gatewayUrl });
    }

    return NextResponse.json({ error: "خطا در اتصال به درگاه زرین‌پال", details: data }, { status: 400 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "خطای سرور درگاه پرداخت" }, { status: 500 });
  }
}
