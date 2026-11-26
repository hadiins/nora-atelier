import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { isAdminAuthorized } from "@/lib/adminGuard";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminAuthorized(req))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "فقط فرمت‌های JPG، PNG و WEBP مجاز هستند" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "حداکثر حجم مجاز ۵ مگابایت است" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = `${crypto.randomUUID()}.${ext}`;

    // اگر Vercel Blob فعال باشد، فایل دائمی در فضای ابری ذخیره می‌شود
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blobRes = await fetch(`https://blob.vercel-storage.com/${safeName}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          "content-type": file.type,
        },
        body: buffer,
      });
      if (blobRes.ok) {
        const blobData = await blobRes.json();
        return NextResponse.json({ url: blobData.url, storage: "vercel-blob" });
      }
    }

    // ذخیره روی سرور شخصی (VPS / Local) در پوشه public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({ url: `/uploads/${safeName}`, storage: "local" });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json({ error: "خطا در آپلود تصویر" }, { status: 500 });
  }
}
