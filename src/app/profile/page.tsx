import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  let userProfile: { fullName: string | null; defaultAddress: string | null; defaultPostalCode: string | null } | null = null;
  let orders: {
    id: string;
    orderNumber: string;
    address: string;
    trackingCode: string | null;
    totalAmount: number;
    status: string;
  }[] = [];

  try {
    userProfile = await prisma.user.findUnique({
      where: { phone: session.phone },
      select: { fullName: true, defaultAddress: true, defaultPostalCode: true },
    });
    orders = await prisma.order.findMany({
      where: { phone: session.phone },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    orders = [];
  }

  return (
    <div className="min-h-screen bg-sand py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-black/5">
          <div>
            <h1 className="text-xl font-black">پروفایل کاربری شما</h1>
            <p className="text-xs text-muted mt-1" dir="ltr">{session.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-charcoal text-cream px-5 py-2.5 rounded-full text-xs font-bold hover:bg-gold transition">
              بازگشت به فروشگاه
            </Link>
            <form action="/api/admin/login" method="DELETE">
              <Link href="/login" className="bg-sand px-4 py-2.5 rounded-full text-xs font-bold hover:bg-black/10 transition">
                تغییر حساب
              </Link>
            </form>
          </div>
        </div>

        <ProfileForm
          initialName={userProfile?.fullName || ""}
          initialAddress={userProfile?.defaultAddress || ""}
          initialPostalCode={userProfile?.defaultPostalCode || ""}
        />

        <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-4">
          <h2 className="font-bold text-base">تاریخچه سفارش‌ها</h2>
          {orders.length === 0 ? (
            <p className="text-xs text-muted">هنوز سفارشی با این شماره ثبت نکرده‌اید.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-sand/70 flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <p className="font-black">{o.orderNumber}</p>
                    <p className="text-muted mt-0.5">{o.address}</p>
                    {o.trackingCode && <p className="text-emerald-700 font-bold mt-1">کد رهگیری پست: {o.trackingCode}</p>}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gold">{o.totalAmount.toLocaleString("fa-IR")} تومان</p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white font-bold text-[10px]">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
