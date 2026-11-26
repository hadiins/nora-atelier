import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  try {
    const { productId, label, stock, price } = await req.json();
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        label,
        stock: Number(stock || 10),
        price: price ? Number(price) : null,
        sku: `VAR-${Date.now().toString().slice(-6)}`,
      },
    });
    return NextResponse.json({ variant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در افزودن واریانت" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const { id, stock, price } = await req.json();
  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      ...(stock !== undefined ? { stock: Math.max(0, Number(stock)) } : {}),
      ...(price !== undefined ? { price: price ? Number(price) : null } : {}),
    },
  });
  return NextResponse.json({ variant });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
  await prisma.productVariant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
