# آتلیه نورا (Nora Atelier) — فروشگاه لوکس پوشاک و عطر (بدون ووکامرس)

پروژه کامل Full-Stack فروشگاهی ساخته‌شده با **Next.js 15 (App Router)**، **TypeScript**، **Tailwind CSS**، **Zustand**، **Prisma ORM** و **PostgreSQL**.

## پیش‌نیازها
- Node.js 20+
- Docker (برای راه‌اندازی سریع PostgreSQL و Redis)

## مراحل راه‌اندازی سریع

1. **نصب پکیج‌ها:**
   ```bash
   npm install
   ```

2. **تنظیم متغیرهای محیطی:**
   فایل `.env.example` را به `.env` کپی کنید و مقادیر را تنظیم نمایید:
   ```bash
   cp .env.example .env
   ```

3. **راه‌اندازی دیتابیس PostgreSQL و Redis با Docker:**
   ```bash
   docker-compose up -d
   ```

4. **ساخت جداول دیتابیس و تزریق داده‌های اولیه (Seed):**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **اجرای پروژه:**
   ```bash
   npm run dev
   ```
   سایت روی آدرس `http://localhost:3000` و پنل مدیریت روی `http://localhost:3000/admin` در دسترس است.
