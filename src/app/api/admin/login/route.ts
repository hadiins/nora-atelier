import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(`admin-login:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "تعداد تلاش زیاد است. ۱ دقیقه دیگر امتحان کنید." }, { status: 429 });
    }

    const { username, password } = await req.json();
    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_API_SECRET || "admin1234";

    const uMatch = username === expectedUser;
    const pBuf = Buffer.from(String(password || ""));
    const eBuf = Buffer.from(expectedPass);
    const pMatch = pBuf.length === eBuf.length && crypto.timingSafeEqual(pBuf, eBuf);

    if (!uMatch || !pMatch) {
      return NextResponse.json({ error: "نام کاربری یا کلمه عبور اشتباه است." }, { status: 401 });
    }

    const token = signSessionToken({ userId: "admin", phone: "admin", role: "ADMIN" });
    const res = NextResponse.json({ success: true });
    res.cookies.set("nora_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 86400,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "خطا در ورود ادمین" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("nora_session");
  return res;
}
