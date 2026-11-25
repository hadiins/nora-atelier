import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(`otp:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "تعداد درخواست زیاد است. ۱ دقیقه دیگر تلاش کنید." }, { status: 429 });
    }

    const { phone } = await req.json();
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست (مثال: 09123456789)" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await prisma.otpCode.create({
      data: { phone, code, expiresAt },
    });

    if (process.env.KAVENEGAR_API_KEY) {
      await fetch(
        `https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/verify/lookup.json?receptor=${phone}&token=${code}&template=verify`
      );
      return NextResponse.json({ success: true, message: "کد تایید پیامکی ارسال شد." });
    }

    // در حالت تست (وقتی پنل پیامک کاوه‌نگار متصل نیست) کد آزمایشی برگردانده می‌شود
    return NextResponse.json({
      success: true,
      devCode: code,
      message: `حالت آزمایشی (پنل پیامک متصل نیست): کد تایید شما ${code} است.`,
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json({ error: "خطا در اتصال به دیتابیس برای ذخیره کد تایید." }, { status: 500 });
  }
}
