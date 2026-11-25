import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategorySlug } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();
    const sort = searchParams.get("sort") || "featured";

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") {
      where.category = category as CategorySlug;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sort === "price-asc"
        ? { price: "asc" as const }
        : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "rating"
        ? { rating: "desc" as const }
        : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        variants: true,
        perfumeNote: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-secret");
    if (process.env.ADMIN_API_SECRET && adminKey !== process.env.ADMIN_API_SECRET) {
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
        ...(body.perfumeNote
          ? {
              perfumeNote: {
                create: body.perfumeNote,
              },
            }
          : {}),
      },
      include: { variants: true, perfumeNote: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}
