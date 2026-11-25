import { PrismaClient, CategorySlug } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.promoCode.upsert({
    where: { code: "LUX20" },
    update: {},
    create: { code: "LUX20", discountPct: 20, isActive: true },
  });

  const sampleProducts = [
    {
      slug: "cashmere-oversized-coat-nora",
      name: "پالتو کشمیر اورسایز نورا",
      description: "دوخته‌شده از پشم و کشمیر طبیعی با برش مینیمال و آستر ساتن ابریشم، مناسب استایل‌های لوکس پاییزی.",
      category: CategorySlug.WOMEN,
      price: 4850000,
      oldPrice: 5600000,
      badge: "جدید",
      rating: 4.9,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1483985988635-76728e1935b8?auto=format&fit=crop&w=700&q=80",
      ],
      colors: ["#D6CFC7", "#1C1C1C", "#8C6D46"],
      variants: [
        { label: "S", sku: "NORA-WM-01-S", stock: 8 },
        { label: "M", sku: "NORA-WM-01-M", stock: 12 },
        { label: "L", sku: "NORA-WM-01-L", stock: 6 },
      ],
    },
    {
      slug: "milano-slim-wool-blazer",
      name: "کت تک پشمی اسلیم‌فیت میلانو",
      description: "کت مردانه با پارچه مرینوس ایتالیایی، تن‌خور دقیق و یقه کلاسیک.",
      category: CategorySlug.MEN,
      price: 5400000,
      oldPrice: null,
      badge: "پرفروش",
      rating: 4.8,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80",
      ],
      colors: ["#1E242B", "#4A453E"],
      variants: [
        { label: "48", sku: "NORA-MN-01-48", stock: 5 },
        { label: "50", sku: "NORA-MN-01-50", stock: 9 },
        { label: "52", sku: "NORA-MN-01-52", stock: 7 },
      ],
    },
    {
      slug: "tom-ford-oud-wood",
      name: "عطر تام فورد عود وود (Oud Wood)",
      description: "رایحه‌ای گرم، چوبی و اشرافی با نت‌های عود، چوب صندل، هل و وانیل.",
      category: CategorySlug.PERFUME,
      price: 11200000,
      oldPrice: 12500000,
      badge: "اورجینال",
      rating: 5.0,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=80",
      ],
      colors: ["#2C221E"],
      variants: [
        { label: "50ml", sku: "NORA-PF-01-50", stock: 10 },
        { label: "100ml", sku: "NORA-PF-01-100", stock: 6 },
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
      slug: "organic-kids-hoodie-set",
      name: "ست هودی و شلوار ارگانیک کودک",
      description: "تولیدشده از پنبه ارگانیک ضدحساسیت، بسیار نرم و راحت برای کودکان.",
      category: CategorySlug.KIDS,
      price: 1450000,
      oldPrice: 1750000,
      badge: "نخ پنبه ۱۰۰٪",
      rating: 4.9,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=700&q=80",
      ],
      colors: ["#E2D5C8", "#7D8C75"],
      variants: [
        { label: "۳-۴ سال", sku: "NORA-KD-01-34", stock: 15 },
        { label: "۵-۶ سال", sku: "NORA-KD-01-56", stock: 11 },
      ],
    },
  ];

  for (const item of sampleProducts) {
    const { variants, perfumeNote, ...productData } = item;
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...productData,
        variants: { create: variants },
        ...(perfumeNote ? { perfumeNote: { create: perfumeNote } } : {}),
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
