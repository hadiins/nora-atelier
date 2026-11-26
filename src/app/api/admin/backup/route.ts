import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const [products, orders, settings, promos, users] = await Promise.all([
    prisma.product.findMany({ include: { variants: true, perfumeNote: true } }),
    prisma.order.findMany({ include: { items: true } }),
    prisma.siteSetting.findMany(),
    prisma.promoCode.findMany(),
    prisma.user.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    products,
    orders,
    settings,
    promos,
    users,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename=nora-backup-${Date.now()}.json`,
    },
  });
}
