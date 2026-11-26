import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategorySlug } from "@prisma/client";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  try {
    const { category, discountPct } = await req.json();
    const where = category && category !== "ALL" ? { category: category as CategorySlug } : {};
    const products = await prisma.product.findMany({ where });

    let updatedCount = 0;
    for (const p of products) {
      if (Number(discountPct) === 0) {
        if (p.oldPrice) {
          await prisma.product.update({
            where: { id: p.id },
            data: { price: p.oldPrice, oldPrice: null, badge: null },
          });
          updatedCount++;
        }
      } else {
        const basePrice = p.oldPrice || p.price;
        const newPrice = Math.round(basePrice * (1 - Number(discountPct) / 100));
        await prisma.product.update({
          where: { id: p.id },
          data: { price: newPrice, oldPrice: basePrice, badge: `${discountPct}٪ تخفیف` },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch {
    return NextResponse.json({ error: "خطا در اعمال تخفیف گروهی" }, { status: 500 });
  }
}
