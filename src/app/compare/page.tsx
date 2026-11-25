"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProductDTO } from "@/types/store";

export default function ComparePerfumesPage() {
  const [perfumes, setPerfumes] = useState<ProductDTO[]>([]);
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  useEffect(() => {
    fetch("/api/products?category=PERFUME")
      .then((r) => r.json())
      .then((d) => {
        const list = d.products || [];
        setPerfumes(list);
        if (list[0]) setLeftId(list[0].id);
        if (list[1]) setRightId(list[1].id);
      })
      .catch(() => {});
  }, []);

  const left = perfumes.find((p) => p.id === leftId);
  const right = perfumes.find((p) => p.id === rightId);

  return (
    <div className="min-h-screen bg-obsidian text-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-goldLight font-bold">ابزار تخصصی عطر</span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">مقایسه تخصصی عطر و ادکلن</h1>
          </div>
          <Link href="/" className="bg-white/10 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-goldLight hover:text-obsidian transition">
            بازگشت به فروشگاه
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { val: leftId, set: setLeftId, item: left },
            { val: rightId, set: setRightId, item: right },
          ].map((col, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
              <select
                value={col.val}
                onChange={(e) => col.set(e.target.value)}
                className="w-full bg-charcoal border border-white/15 rounded-xl px-4 py-2.5 text-xs text-cream"
              >
                {perfumes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {col.item && (
                <div className="space-y-4 text-xs">
                  <img src={col.item.images[0]} alt={col.item.name} className="w-full aspect-[4/3] object-cover rounded-2xl" />
                  <h2 className="text-lg font-black text-goldLight">{col.item.name}</h2>
                  <p className="font-bold text-sm">{col.item.price.toLocaleString("fa-IR")} تومان</p>
                  {col.item.perfumeNote && (
                    <div className="space-y-2 border-t border-white/10 pt-3 text-white/80">
                      <p><strong>گروه بویایی:</strong> {col.item.perfumeNote.scentGroup}</p>
                      <p><strong>نت اولیه:</strong> {col.item.perfumeNote.topNotes}</p>
                      <p><strong>نت میانی:</strong> {col.item.perfumeNote.midNotes}</p>
                      <p><strong>نت پایه:</strong> {col.item.perfumeNote.baseNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
