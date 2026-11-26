import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthorized } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  try {
    const { productId, authorName, rating, comment, imageUrl } = await req.json();
    if (!productId || !authorName || !comment) {
      return NextResponse.json({ error: "اطلاعات نظر کامل نیست" }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: { productId, authorName, rating: Number(rating || 5), comment, imageUrl: imageUrl || null, isApproved: false },
    });
    return NextResponse.json({ review, message: "نظر شما ثبت شد و پس از تایید مدیر نمایش داده می‌شود." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت نظر" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const { id, isApproved } = await req.json();
  const review = await prisma.review.update({ where: { id }, data: { isApproved: Boolean(isApproved) } });
  return NextResponse.json({ review });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
