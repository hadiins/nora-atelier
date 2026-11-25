import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, items } = await req.json();
    if (!phone || !items?.length) return NextResponse.json({ ok: false });

    await prisma.abandonedCart.create({
      data: { phone, itemsJson: JSON.stringify(items) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
