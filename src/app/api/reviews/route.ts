import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, authorName, rating, comment, imageUrl } = await req.json();
    if (!productId || !authorName || !comment) {
      return NextResponse.json({ error: "اطلاعات نظر کامل نیست" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        authorName,
        rating: Number(rating || 5),
        comment,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطا در ثبت نظر" }, { status: 500 });
  }
}
