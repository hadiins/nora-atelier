import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, subject, message } = await req.json();
    if (!fullName || !phone || !message) {
      return NextResponse.json({ error: "لطفاً تمام فیلدها را پر کنید" }, { status: 400 });
    }
    await prisma.contactMessage.create({
      data: { fullName, phone, subject: subject || "پشتیبانی", message },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ارسال پیام" }, { status: 500 });
  }
}
