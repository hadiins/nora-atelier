import ProductReviewsAndAlerts from "@/components/ProductReviewsAndAlerts";
import ProductGallery from "@/components/ProductGallery";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true, perfumeNote: true, reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } } },
    });
  } catch {
    product = null;
  }

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-charcoal">
          ← بازگشت به گالری محصولات
        </Link>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-black/5 grid md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />
          <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-gold uppercase">{product.category}</span>
              <h1 className="text-3xl font-black">{product.name}</h1>
              <p className="text-2xl font-black text-charcoal">{product.price.toLocaleString("fa-IR")} تومان</p>
              <p className="text-sm text-muted leading-relaxed">{product.description}</p>

              {product.perfumeNote && (
                <div className="bg-sand p-4 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-gold">مشخصات رایحه و نت‌ها</p>
                  <p><strong>نت اولیه:</strong> {product.perfumeNote.topNotes}</p>
                  <p><strong>نت میانی:</strong> {product.perfumeNote.midNotes}</p>
                  <p><strong>نت پایه:</strong> {product.perfumeNote.baseNotes}</p>
                  {product.perfumeNote.batchCode && <p><strong>بچ‌کد اصالت:</strong> {product.perfumeNote.batchCode}</p>}
                </div>
              )}

              <div>
                <p className="text-xs font-bold mb-2">سایز / حجم موجود:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <span key={v.id} className="px-4 py-2 rounded-full bg-sand text-xs font-bold border border-black/10">
                      {v.label} ({v.stock} عدد)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/checkout" className="block text-center bg-charcoal text-cream py-4 rounded-full text-sm font-bold hover:bg-gold transition">
              ادامه خرید و تسویه حساب
            </Link>
          </div>
        </div>
        <ProductReviewsAndAlerts
          productId={product.id}
          category={product.category}
          initialReviews={product.reviews}
          hasOutOfStock={product.variants.some((v) => v.stock === 0) || true}
        />
      </div>
    </div>
  );
}
