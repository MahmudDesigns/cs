"use client";

import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="card relative aspect-[16/10] overflow-hidden !rounded-[1.75rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={current}
          alt={title}
          className="h-full w-full object-cover transition-opacity duration-500"
        />
        <span className="font-num absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-paper backdrop-blur">
          {active + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl transition-all ${
                i === active ? "ring-2 ring-moss ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
