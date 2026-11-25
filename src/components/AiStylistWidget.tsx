"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Send } from "lucide-react";

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
}

export default function AiStylistWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("سلام! من مشاور هوشمند استایل و عطر آتلیه نورا هستم. چه مناسبتی در پیش دارید؟");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setReply(data.reply || "پیشنهادهای زیر برای شما انتخاب شد:");
      setSuggestions(data.suggestions || []);
      setQuery("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-obsidian text-goldLight px-5 py-3.5 rounded-full shadow-2xl border border-goldLight/30 hover:scale-105 transition text-xs font-bold"
        >
          <Sparkles className="w-4 h-4" />
          <span>مشاور هوشمند استایل و عطر</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-cream rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col">
          <div className="bg-obsidian text-cream p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-goldLight" />
              <span className="text-xs font-bold">استایلیست هوشمند نورا</span>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto text-xs">
            <div className="bg-sand p-3 rounded-2xl leading-relaxed">{reply}</div>
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/products/${s.slug}`}
                className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-black/5 hover:border-gold transition"
              >
                <img src={s.images[0]} alt={s.name} className="w-11 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold line-clamp-1">{s.name}</p>
                  <p className="text-gold font-bold mt-0.5">{s.price.toLocaleString("fa-IR")} تومان</p>
                </div>
              </Link>
            ))}
          </div>

          <form onSubmit={handleAsk} className="p-3 border-t border-black/10 flex gap-2 bg-white">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثلاً: عطر گرم برای مهمانی شب..."
              className="flex-1 bg-sand rounded-full px-4 py-2 text-xs focus:outline-none"
            />
            <button disabled={loading} className="bg-charcoal text-cream p-2.5 rounded-full hover:bg-gold transition">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
