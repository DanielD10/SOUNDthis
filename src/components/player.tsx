"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { duration } from "@/lib/format";
import type { Track } from "@/lib/types";
import { Cover } from "./cover";

type Now = { track: Track; queue: Track[]; artistId: number };

type PlayerApi = {
  now: Now | null;
  playing: boolean;
  failed: boolean;
  play: (track: Track, queue: Track[], artistId: number) => void;
  toggle: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerApi | null>(null);

// Playback position lives outside React state so only the active bar re-renders each frame.
const position = {
  value: 0,
  listeners: new Set<() => void>(),
  set(v: number) {
    this.value = v;
    this.listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    position.listeners.add(l);
    return () => position.listeners.delete(l);
  },
};

export function useProgress(active: boolean) {
  return useSyncExternalStore(
    position.subscribe,
    () => (active ? position.value : 0),
    () => 0,
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer needs <PlayerProvider>");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [now, setNow] = useState<Now | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  const start = useCallback((next: Now) => {
    const el = audio.current;
    if (!el || !next.track.preview) return;
    setNow(next);
    setFailed(false);
    position.set(0);
    el.src = next.track.preview;
    el.play().catch(() => {
      setPlaying(false);
      setFailed(true);
    });
  }, []);

  const play = useCallback<PlayerApi["play"]>(
    (track, queue, artistId) => {
      const el = audio.current;
      if (el && nowRef.current?.track.id === track.id) {
        if (el.paused) el.play().catch(() => setFailed(true));
        else el.pause();
        return;
      }
      start({ track, queue, artistId });
    },
    [start],
  );

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el || !nowRef.current) return;
    if (el.paused) el.play().catch(() => setFailed(true));
    else el.pause();
  }, []);

  const stop = useCallback(() => {
    audio.current?.pause();
    setNow(null);
    position.set(0);
  }, []);

  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    audio.current = el;
    let raf = 0;
    const tick = () => {
      if (el.duration) position.set(el.currentTime / el.duration);
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
    };
    const onEnded = () => {
      const cur = nowRef.current;
      if (!cur) return;
      const rest = cur.queue.slice(cur.queue.findIndex((t) => t.id === cur.track.id) + 1);
      const next = rest.find((t) => t.preview);
      if (next) start({ ...cur, track: next });
      else position.set(0);
    };
    const onError = () => {
      setPlaying(false);
      setFailed(true);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      cancelAnimationFrame(raf);
      el.pause();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [start]);

  const api = useMemo(
    () => ({ now, playing, failed, play, toggle, stop }),
    [now, playing, failed, play, toggle, stop],
  );

  return (
    <PlayerContext.Provider value={api}>
      {children}
      <NowPlaying />
    </PlayerContext.Provider>
  );
}

function NowPlaying() {
  const { now, playing, failed, toggle, stop } = usePlayer();
  const progress = useProgress(Boolean(now));
  if (!now) return null;
  const { track } = now;
  const left = Math.max(0, 30 - progress * 30);

  return (
    <div
      role="region"
      aria-label="Now playing"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-shellac/95 backdrop-blur"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-line">
        <div className="h-full origin-left bg-brass" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-8">
        <Cover src={track.album.cover} name={track.album.title} className="size-11 shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ivory">{track.title}</p>
          <p className="truncate text-sm text-dust">
            <Link href={`/artist/${now.artistId}`} className="hover:text-ivory">
              {track.artist}
            </Link>
          </p>
        </div>
        <p className="hidden text-sm tabular-nums text-dust sm:block">
          {failed ? "Preview wouldn't load" : `${duration(left)} left in preview`}
        </p>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="grid size-11 place-items-center rounded-full bg-ivory text-shellac transition-colors hover:bg-brass"
        >
          <PlayIcon playing={playing} />
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label="Close player"
          className="grid size-9 place-items-center rounded-full text-dust hover:text-ivory"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function PlayIcon({ playing, className = "size-4" }: { playing: boolean; className?: string }) {
  return playing ? (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="3.5" y="2.5" width="3" height="11" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  );
}
