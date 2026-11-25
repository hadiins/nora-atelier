import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    const otp = await prisma.otpCode.findFirst({
      where: { phone, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ error: "کد تایید نامعتبر یا منقضی شده است." }, { status: 400 });
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, fullName: "کاربر آتلیه نورا" },
    });

    const token = signSessionToken({ userId: user.id, phone: user.phone, role: user.role });

    const res = NextResponse.json({ success: true, user: { id: user.id, phone: user.phone, role: user.role } });
    res.cookies.set("nora_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 86400,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: "خطا در تایید کد" }, { status: 500 });
  }
}
