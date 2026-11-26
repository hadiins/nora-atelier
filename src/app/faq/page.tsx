import Link from "next/link";

const FAQS = [
  { q: "آیا عطرها و ادکلن‌ها ۱۰۰٪ اورجینال هستند؟", a: "بله، تمامی عطرها دارای بچ‌کد معتبر و قابل استعلام از سایت رسمی برندها بوده و با ضمانت اصالت مادام‌العمر عرضه می‌شوند." },
  { q: "شرایط تعویض سایز پوشاک چگونه است؟", a: "تا ۷ روز پس از تحویل کالا، در صورت سالم بودن اتیکت و عدم استفاده، امکان تعویض رایگان سایز برای پوشاک زنانه، مردانه و بچه‌گانه وجود دارد." },
  { q: "زمان ارسال سفارش‌ها چقدر است؟", a: "سفارش‌های تهران با پیک فوری ظرف ۲۴ ساعت و سفارش‌های شهرستان با پست پیشتاز یا تیپاکس ظرف ۲ تا ۴ روز کاری تحویل داده می‌شوند." },
  { q: "دکانت عطر چیست؟", a: "دکانت به معنی انتقال عطر اورجینال از شیشه اصلی به شیشه‌های کوچک ۵ یا ۱۰ میلی‌لیتری است تا پیش از خرید شیشه کامل، رایحه را روی پوست خود تست کنید." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream py-14 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">سوالات متداول و قوانین مرجوعی</h1>
          <Link href="/" className="bg-charcoal text-cream px-5 py-2.5 rounded-full text-xs font-bold">بازگشت</Link>
        </div>
        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <div key={i} className="bg-sand p-6 rounded-3xl space-y-2">
              <h2 className="font-bold text-base text-charcoal">{item.q}</h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
