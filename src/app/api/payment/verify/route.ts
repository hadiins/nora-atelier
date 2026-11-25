import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId, authority } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });

    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const verifyUrl = isSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://api.zarinpal.com/pg/v4/payment/verify.json";

    const res = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: order.totalAmount * 10,
        authority,
      }),
    });

    const data = await res.json();
    if (data?.data?.code === 100 || data?.data?.code === 101) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", refId: String(data.data.ref_id) },
      });
      return NextResponse.json({ success: true, refId: data.data.ref_id });
    }

    return NextResponse.json({ success: false, error: "تراکنش تایید نشد" }, { status: 400 });
  } catch (error) {
    console.error("verify payment error:", error);
    return NextResponse.json({ error: "خطای تایید پرداخت" }, { status: 500 });
  }
}
