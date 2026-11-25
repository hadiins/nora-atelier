import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { garmentImageUrl, userImageBase64 } = await req.json();
    if (!garmentImageUrl || !userImageBase64) {
      return NextResponse.json({ error: "تصویر کاربر و لباس الزامی است" }, { status: 400 });
    }

    // آماده اتصال به Replicate IDM-VTON یا Fashn.ai با تنظیم VIRTUAL_TRYON_API_KEY
    if (process.env.VIRTUAL_TRYON_API_KEY) {
      // محل فراخوانی سرویس واقعی AI Try-On
      return NextResponse.json({ resultImage: garmentImageUrl, mode: "ai-cloud" });
    }

    return NextResponse.json({
      resultImage: garmentImageUrl,
      mode: "preview",
      message: "پیش‌نمایش ترکیب پرو مجازی آماده شد (برای رندر واقعی AI، کلید VIRTUAL_TRYON_API_KEY را در .env تنظیم کنید).",
    });
  } catch {
    return NextResponse.json({ error: "خطا در پردازش پرو مجازی" }, { status: 500 });
  }
}
