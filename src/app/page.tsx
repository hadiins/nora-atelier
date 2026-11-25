import { prisma } from "@/lib/prisma";
import StorefrontClient from "@/components/StorefrontClient";
import { ProductDTO } from "@/types/store";
import { getFeatureFlagsMap } from "@/lib/features";

export const dynamic = "force-dynamic";

const FALLBACK_PRODUCTS: ProductDTO[] = [
  {
    id: "demo-1",
    slug: "cashmere-oversized-coat-nora",
    name: "پالتو کشمیر اورسایز نورا",
    description: "دوخته‌شده از پشم و کشمیر طبیعی با برش مینیمال و آستر ساتن ابریشم، مناسب استایل‌های لوکس پاییزی.",
    category: "WOMEN",
    price: 4850000,
    oldPrice: 5600000,
    badge: "جدید",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1483985988635-76728e1935b8?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#D6CFC7", "#1C1C1C", "#8C6D46"],
    variants: [
      { id: "v1", label: "S", sku: "DEMO-WM-S", stock: 8 },
      { id: "v2", label: "M", sku: "DEMO-WM-M", stock: 12 },
      { id: "v3", label: "L", sku: "DEMO-WM-L", stock: 6 },
    ],
  },
  {
    id: "demo-2",
    slug: "milano-slim-wool-blazer",
    name: "کت تک پشمی اسلیم‌فیت میلانو",
    description: "کت مردانه با پارچه مرینوس ایتالیایی، تن‌خور دقیق و یقه کلاسیک.",
    category: "MEN",
    price: 5400000,
    badge: "پرفروش",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#1E242B", "#4A453E"],
    variants: [
      { id: "v4", label: "48", sku: "DEMO-MN-48", stock: 5 },
      { id: "v5", label: "50", sku: "DEMO-MN-50", stock: 9 },
      { id: "v6", label: "52", sku: "DEMO-MN-52", stock: 7 },
    ],
  },
  {
    id: "demo-3",
    slug: "tom-ford-oud-wood",
    name: "عطر تام فورد عود وود (Oud Wood)",
    description: "رایحه‌ای گرم، چوبی و اشرافی با نت‌های عود، چوب صندل، هل و وانیل.",
    category: "PERFUME",
    price: 11200000,
    oldPrice: 12500000,
    badge: "اورجینال",
    rating: 5.0,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#2C221E"],
    variants: [
      { id: "v7", label: "دکانت 5ml", sku: "DEMO-PF-5", stock: 20 },
      { id: "v8", label: "50ml", sku: "DEMO-PF-50", stock: 10 },
      { id: "v9", label: "100ml", sku: "DEMO-PF-100", stock: 6 },
    ],
    perfumeNote: {
      scentGroup: "woody",
      topNotes: "هل، فلفل صورتی، چوب بلسان",
      midNotes: "عود، چوب صندل، وتیور",
      baseNotes: "وانیل، دانه تونکا، کهربا",
      batchCode: "A94-2025",
    },
  },
  {
    id: "demo-4",
    slug: "organic-kids-hoodie-set",
    name: "ست هودی و شلوار ارگانیک کودک",
    description: "تولیدشده از پنبه ارگانیک ضدحساسیت، بسیار نرم و راحت برای کودکان.",
    category: "KIDS",
    price: 1450000,
    oldPrice: 1750000,
    badge: "نخ پنبه ۱۰۰٪",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#E2D5C8", "#7D8C75"],
    variants: [
      { id: "v10", label: "۳-۴ سال", sku: "DEMO-KD-34", stock: 15 },
      { id: "v11", label: "۵-۶ سال", sku: "DEMO-KD-56", stock: 11 },
    ],
  },
  {
    id: "demo-5",
    slug: "cream-raw-silk-blouse",
    name: "شومیز ابریشم خام کرم",
    description: "شومیز ظریف و تنفس‌پذیر با دکمه‌های صدفی، مناسب استایل اسمارت کژوال.",
    category: "WOMEN",
    price: 2350000,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#F4EFE6", "#D9C3B0"],
    variants: [
      { id: "v12", label: "S", sku: "DEMO-WM2-S", stock: 7 },
      { id: "v13", label: "M", sku: "DEMO-WM2-M", stock: 9 },
    ],
  },
  {
    id: "demo-6",
    slug: "dior-sauvage-elixir",
    name: "عطر دیور ساواج الکسیر",
    description: "غلظت الکسیر با رایحه‌ای ادویه‌ای و آروماتیک؛ ماندگاری فوق‌العاده.",
    category: "PERFUME",
    price: 8900000,
    oldPrice: 9600000,
    badge: "پرفروش",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#101828"],
    variants: [
      { id: "v14", label: "60ml", sku: "DEMO-PF2-60", stock: 8 },
      { id: "v15", label: "100ml", sku: "DEMO-PF2-100", stock: 5 },
    ],
    perfumeNote: {
      scentGroup: "spicy",
      topNotes: "دارچین، جوز هندی، گریپ‌فروت",
      midNotes: "اسطوخودوس ارگانیک",
      baseNotes: "چوب صندل، کهربا، نعناع هندی",
      batchCode: "4C01",
    },
  },
  {
    id: "demo-7",
    slug: "italian-linen-shirt-men",
    name: "پیراهن کتان ایتالیایی مردانه",
    description: "الیاف کتان خنک و ضدچروک با دوخت تمیز و تن‌خور مدرن.",
    category: "MEN",
    price: 1980000,
    oldPrice: 2300000,
    badge: "تخفیف",
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#FFFFFF", "#A7B3BD"],
    variants: [
      { id: "v16", label: "M", sku: "DEMO-MN2-M", stock: 10 },
      { id: "v17", label: "L", sku: "DEMO-MN2-L", stock: 10 },
    ],
  },
  {
    id: "demo-8",
    slug: "kids-light-puffer-jacket",
    name: "کاپشن بادی سبک کودک",
    description: "بسیار سبک، ضدآب و گرم با عایق الیاف مدرن برای روزهای سرد.",
    category: "KIDS",
    price: 2150000,
    badge: "جدید",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
    ],
    colors: ["#C89B6E", "#2D3B45"],
    variants: [
      { id: "v18", label: "۴-۵ سال", sku: "DEMO-KD2-45", stock: 9 },
      { id: "v19", label: "۶-۷ سال", sku: "DEMO-KD2-67", stock: 7 },
    ],
  },
];

export default async function HomePage() {
  let products: ProductDTO[] = [];
  const flags = await getFeatureFlagsMap();

  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { variants: true, perfumeNote: true },
    });
    products = dbProducts.length > 0 ? (dbProducts as unknown as ProductDTO[]) : FALLBACK_PRODUCTS;
  } catch {
    products = FALLBACK_PRODUCTS;
  }

  return <StorefrontClient initialProducts={products} flags={flags} />;
}
