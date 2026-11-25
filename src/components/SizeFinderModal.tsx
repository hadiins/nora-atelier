"use client";

import React, { useState } from "react";

export default function SizeFinderModal({ onClose }: { onClose: () => void }) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);

  const getRecommendedSize = () => {
    const bmi = weight / ((height / 100) * (height / 100));
    if (weight < 58 || height < 163) return "S (یا ۴۶)";
    if (weight < 70 && bmi < 24) return "M (یا ۴۸)";
    if (weight < 84 && bmi < 27) return "L (یا ۵۰)";
    return "XL (یا ۵۲/۵۴)";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black">راهنمای سایز هوشمند</h3>
          <button onClick={onClose} className="text-sm font-bold">✕</button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">قد شما (سانتی‌متر): {height}</label>
            <input type="range" min={145} max={200} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-gold" />
          </div>
          <div>
            <label className="font-bold block mb-1">وزن شما (کیلوگرم): {weight}</label>
            <input type="range" min={40} max={125} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-gold" />
          </div>
        </div>
        <div className="bg-obsidian text-cream p-4 rounded-2xl text-center">
          <p className="text-xs text-white/70">سایز پیشنهادی آتلیه برای شما:</p>
          <p className="text-2xl font-black text-goldLight mt-1">{getRecommendedSize()}</p>
        </div>
      </div>
    </div>
  );
}
