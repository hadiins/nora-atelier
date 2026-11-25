import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FEATURES } from "@/lib/features";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET() {
  try {
    for (const feat of DEFAULT_FEATURES) {
      await prisma.featureFlag.upsert({
        where: { key: feat.key },
        update: {},
        create: feat,
      });
    }
    const features = await prisma.featureFlag.findMany({ orderBy: { category: "asc" } });
    return NextResponse.json({ features });
  } catch {
    return NextResponse.json({ features: DEFAULT_FEATURES });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const { key, isEnabled } = await req.json();
    const updated = await prisma.featureFlag.update({
      where: { key },
      data: { isEnabled: Boolean(isEnabled) },
    });
    return NextResponse.json({ feature: updated });
  } catch {
    return NextResponse.json({ error: "خطا در تغییر وضعیت قابلیت" }, { status: 500 });
  }
}
