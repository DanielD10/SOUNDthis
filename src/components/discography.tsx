"use client";

import { useState } from "react";
import { year } from "@/lib/format";
import type { Release, ReleaseKind } from "@/lib/types";
import { Cover } from "./cover";

const FILTERS: { kind: ReleaseKind | "all"; label: string }[] = [
  { kind: "all", label: "Everything" },
  { kind: "album", label: "Albums" },
  { kind: "ep", label: "EPs" },
  { kind: "single", label: "Singles" },
  { kind: "compile", label: "Compilations" },
];

const STEP = 12;

export function Discography({ releases }: { releases: Release[] }) {
  const [filter, setFilter] = useState<ReleaseKind | "all">("all");
  const [shown, setShown] = useState(STEP);

  const count = (k: ReleaseKind | "all") =>
    k === "all" ? releases.length : releases.filter((r) => r.kind === k).length;
  const list = filter === "all" ? releases : releases.filter((r) => r.kind === filter);

  return (
    <div>
      <div role="tablist" aria-label="Release type" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
        {FILTERS.filter((f) => count(f.kind) > 0).map((f) => {
          const on = f.kind === filter;
          return (
            <button
              key={f.kind}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setFilter(f.kind);
                setShown(STEP);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                on ? "bg-ivory text-shellac" : "text-dust hover:text-ivory"
              }`}
            >
              {f.label} <span className={on ? "text-shellac/60" : "text-dust/60"}>{count(f.kind)}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {list.slice(0, shown).map((r) => (
          <li key={r.id}>
            <a href={r.link} target="_blank" rel="noreferrer" className="group block">
              <Cover src={r.cover} name={r.title} className="aspect-square w-full rounded-sm" />
              <p className="mt-3 line-clamp-2 leading-snug text-ivory group-hover:text-brass">{r.title}</p>
              <p className="mt-0.5 text-sm text-dust">
                {year(r.released)}
                {filter === "all" && r.kind !== "album" && `, ${FILTERS.find((f) => f.kind === r.kind)?.label.replace(/s$/, "").toLowerCase()}`}
              </p>
            </a>
          </li>
        ))}
      </ul>

      {list.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + STEP * 2)}
          className="mt-10 rounded-full border border-line px-5 py-2.5 text-sm text-ivory hover:border-ivory"
        >
          Show more ({list.length - shown} left)
        </button>
      )}
    </div>
  );
}
