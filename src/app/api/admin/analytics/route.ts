import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const format = new URL(req.url).searchParams.get("format");
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    const lowStock = await prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
    });

    if (format === "csv") {
      const header = "OrderNumber,Customer,Phone,TotalAmount,Status,PaymentMethod\n";
      const rows = orders
        .map((o) => `${o.orderNumber},"${o.customerName.replace(/"/g, '""')}",${o.phone},${o.totalAmount},${o.status},${o.paymentMethod}`)
        .join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=nora-orders.csv",
        },
      });
    }

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    return NextResponse.json({
      totalOrders: orders.length,
      totalRevenue,
      lowStockCount: lowStock.length,
      lowStock,
    });
  } catch {
    return NextResponse.json({ error: "خطا در دریافت آمار" }, { status: 500 });
  }
}
