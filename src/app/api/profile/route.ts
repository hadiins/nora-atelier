import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { phone: session.phone },
      select: {
        id: true,
        phone: true,
        fullName: true,
        defaultAddress: true,
        defaultPostalCode: true,
        tier: true,
        points: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  try {
    const { fullName, defaultAddress, defaultPostalCode } = await req.json();
    const user = await prisma.user.upsert({
      where: { phone: session.phone },
      update: {
        fullName: fullName ? String(fullName).slice(0, 100) : undefined,
        defaultAddress: defaultAddress ? String(defaultAddress).slice(0, 400) : undefined,
        defaultPostalCode: defaultPostalCode ? String(defaultPostalCode).slice(0, 12) : undefined,
      },
      create: {
        phone: session.phone,
        fullName: fullName ? String(fullName).slice(0, 100) : null,
        defaultAddress: defaultAddress ? String(defaultAddress).slice(0, 400) : null,
        defaultPostalCode: defaultPostalCode ? String(defaultPostalCode).slice(0, 12) : null,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "خطا در ذخیره پروفایل" }, { status: 500 });
  }
}
