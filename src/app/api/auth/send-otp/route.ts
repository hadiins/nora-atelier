import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(`otp:${ip}`, 3, 60_000)) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است. ۱ دقیقه دیگر تلاش کنید." }, { status: 429 });
    }
    const { phone } = await req.json();
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست (مثال: 09123456789)" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ۲ دقیقه اعتبار

    await prisma.otpCode.create({
      data: { phone, code, expiresAt },
    });

    // اگر کلید کاوه‌نگار تنظیم شده باشد پیامک واقعی ارسال می‌شود
    if (process.env.KAVENEGAR_API_KEY) {
      await fetch(
        `https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/verify/lookup.json?receptor=${phone}&token=${code}&template=verify`
      );
    } else {
      console.log(`📱 [DEV OTP] Phone: ${phone} | Code: ${code}`);
    }

    return NextResponse.json({ success: true, message: "کد تایید ارسال شد." });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json({ error: "خطا در ارسال کد تایید" }, { status: 500 });
  }
}
