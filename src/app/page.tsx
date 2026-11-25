import { prisma } from "@/lib/prisma";
import StorefrontClient from "@/components/StorefrontClient";
import { ProductDTO } from "@/types/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: ProductDTO[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { variants: true, perfumeNote: true },
    });
    products = dbProducts as unknown as ProductDTO[];
  } catch {
    // Fallback در صورتی که هنوز دیتابیس migrate نشده باشد
    products = [
      {
        id: "demo-1",
        slug: "cashmere-coat",
        name: "پالتو کشمیر اورسایز نورا",
        description: "پشم و کشمیر طبیعی با برش مینیمال و آستر ساتن ابریشم.",
        category: "WOMEN",
        price: 4850000,
        oldPrice: 5600000,
        badge: "جدید",
        rating: 4.9,
        images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80"],
        colors: ["#D6CFC7", "#1C1C1C"],
        variants: [
          { id: "v1", label: "S", sku: "DEMO-S", stock: 5 },
          { id: "v2", label: "M", sku: "DEMO-M", stock: 8 },
        ],
      },
      {
        id: "demo-2",
        slug: "oud-wood",
        name: "عطر تام فورد عود وود (Oud Wood)",
        description: "رایحه‌ای گرم، چوبی و اشرافی با نت‌های عود، چوب صندل و هل.",
        category: "PERFUME",
        price: 11200000,
        badge: "اورجینال",
        rating: 5.0,
        images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80"],
        colors: ["#2C221E"],
        variants: [
          { id: "v3", label: "50ml", sku: "DEMO-50", stock: 6 },
          { id: "v4", label: "100ml", sku: "DEMO-100", stock: 4 },
        ],
        perfumeNote: {
          scentGroup: "woody",
          topNotes: "هل، فلفل صورتی",
          midNotes: "عود، چوب صندل",
          baseNotes: "وانیل، کهربا",
        },
      },
    ];
  }

  return <StorefrontClient initialProducts={products} />;
}
