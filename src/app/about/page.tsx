import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sand py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl space-y-6">
        <Link href="/" className="text-xs font-bold text-gold">← بازگشت به فروشگاه</Link>
        <h1 className="text-3xl font-black">درباره آتلیه نورا</h1>
        <p className="text-sm text-muted leading-loose">
          آتلیه نورا با هدف ارائه تجربه‌ای متفاوت در خرید آنلاین پوشاک لوکس (زنانه، مردانه، بچه‌گانه) و عطرهای نیش و دیزاینر اورجینال شکل گرفت.
          ما به جای استفاده از قالب‌های تکراری و کند، پلتفرمی اختصاصی و سریع را طراحی کرده‌ایم تا از لحظه انتخاب سایز و تست رایحه تا بسته‌بندی هدیه و تحویل اکسپرس، بالاترین استاندارد کیفیت را تجربه کنید.
        </p>
      </div>
    </div>
  );
}
