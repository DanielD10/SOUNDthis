"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";

/** Thumbnails until clicked, so six iframes don't load up front. */
export function VideoGrid({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
      {videos.map((v) => (
        <li key={v.id}>
          <div className="relative aspect-video overflow-hidden rounded-sm bg-groove">
            {playing === v.id ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                title={v.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(v.id)}
                aria-label={`Play video: ${v.title}`}
                className="group absolute inset-0"
              >
                <img src={v.thumbnail} alt="" loading="lazy" className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 grid size-12 place-items-center rounded-full bg-ivory text-shellac group-hover:bg-brass">
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                    <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
                  </svg>
                </span>
              </button>
            )}
          </div>
          <p className="mt-3 line-clamp-2 leading-snug text-ivory">{v.title}</p>
          <p className="text-sm text-dust">{v.channel}</p>
        </li>
      ))}
    </ul>
  );
}
