"use client";

import React, { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const validImages = images.length > 0 ? images : ["/uploads/placeholder.jpg"];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="space-y-3 bg-sand p-4">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white">
        <img src={validImages[activeIdx]} alt={name} className="w-full h-full object-cover transition duration-500" />
      </div>
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                activeIdx === idx ? "border-gold scale-95" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
