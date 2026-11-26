import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategorySlug } from "@prisma/client";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();
    const sort = searchParams.get("sort") || "featured";

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") where.category = category as CategorySlug;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sort === "price-asc" ? { price: "asc" as const }
        : sort === "price-desc" ? { price: "desc" as const }
        : sort === "rating" ? { rating: "desc" as const }
        : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { variants: true, perfumeNote: true },
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        category: body.category as CategorySlug,
        price: Number(body.price),
        oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        badge: body.badge || null,
        images: body.images || [],
        colors: body.colors || ["#121212"],
        variants: {
          create: (body.variants || []).map((v: { label: string; sku: string; stock: number }) => ({
            label: v.label,
            sku: v.sku,
            stock: Number(v.stock || 10),
          })),
        },
        ...(body.perfumeNote ? { perfumeNote: { create: body.perfumeNote } } : {}),
      },
      include: { variants: true, perfumeNote: true },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const { id, name, price, oldPrice, badge, description } = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(oldPrice !== undefined ? { oldPrice: oldPrice ? Number(oldPrice) : null } : {}),
        ...(badge !== undefined ? { badge: badge || null } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه محصول الزامی است" }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف محصول" }, { status: 500 });
  }
}
