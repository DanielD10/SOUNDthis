"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { compact } from "@/lib/format";
import type { ArtistHit } from "@/lib/types";
import { Cover } from "./cover";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; artists: ArtistHit[] }
  | { kind: "error"; message: string };

export function SearchBox({
  defaultValue = "",
  autoFocus = false,
  size = "lg",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  size?: "lg" | "sm";
}) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState(defaultValue);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const body = (await res.json()) as { artists: ArtistHit[]; error?: string };
        if (!res.ok) setState({ kind: "error", message: body.error ?? "Search is unavailable right now." });
        else setState({ kind: "done", artists: body.artists });
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError")
          setState({ kind: "error", message: "Search is unavailable right now." });
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const artists = state.kind === "done" ? state.artists : [];
  const showList = open && q.trim().length >= 2 && state.kind !== "idle";

  const go = (a: ArtistHit) => {
    setOpen(false);
    router.push(`/artist/${a.id}`);
  };

  const lg = size === "lg";

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        action="/search"
        onSubmit={(e) => {
          if (active >= 0 && artists[active]) {
            e.preventDefault();
            go(artists[active]);
          }
        }}
        className={`flex items-center border-b ${lg ? "border-ivory/40 pb-3" : "border-line pb-2"} focus-within:border-brass`}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search for an artist
        </label>
        <input
          id={`${listId}-input`}
          name="q"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search an artist"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < 2) setState({ kind: "idle" });
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, artists.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={`w-full bg-transparent text-ivory placeholder:text-dust/70 focus:outline-none focus-visible:outline-none ${
            lg ? "font-display text-4xl sm:text-5xl" : "text-base"
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 text-dust hover:text-ivory ${lg ? "text-base" : "text-sm"}`}
        >
          Search
        </button>
      </form>

      {showList && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-md border border-line bg-groove shadow-2xl shadow-black/50">
          {state.kind === "loading" && <p className="px-4 py-3 text-sm text-dust">Searching…</p>}
          {state.kind === "error" && <p className="px-4 py-3 text-sm text-dust">{state.message}</p>}
          {state.kind === "done" && artists.length === 0 && (
            <p className="px-4 py-3 text-sm text-dust">No artists match “{q.trim()}”. Check the spelling.</p>
          )}
          {artists.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Artists">
              {artists.map((a, i) => (
                <li
                  key={a.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => go(a)}
                  onPointerEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                    i === active ? "bg-groove-2" : ""
                  }`}
                >
                  <Cover src={a.picture} name={a.name} className="size-10 rounded-full" />
                  <span className="min-w-0 flex-1 truncate text-ivory">{a.name}</span>
                  <span className="shrink-0 text-sm text-dust">{compact(a.fans)} fans</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
