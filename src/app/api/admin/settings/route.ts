import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }
    const body = await req.json();
    const entries = Object.entries(body) as [string, string][];

    for (const [key, value] of entries) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const updated = await getSiteSettings();
    return NextResponse.json({ settings: updated });
  } catch {
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات" }, { status: 500 });
  }
}
