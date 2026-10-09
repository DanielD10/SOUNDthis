"use client";

import { duration } from "@/lib/format";
import type { Track } from "@/lib/types";
import { geniusSearch, youtubeSearch } from "@/lib/links";
import { PlayIcon, usePlayer, useProgress } from "./player";

export function PlayAll({ tracks, artistId }: { tracks: Track[]; artistId: number }) {
  const { now, playing, play, toggle } = usePlayer();
  const first = tracks.find((t) => t.preview);
  if (!first) return null;
  const mine = now?.artistId === artistId;
  return (
    <button
      type="button"
      onClick={() => (mine ? toggle() : play(first, tracks, artistId))}
      className="inline-flex items-center gap-3 rounded-full bg-ivory py-3 pl-4 pr-6 text-shellac transition-colors hover:bg-brass"
    >
      <PlayIcon playing={mine && playing} />
      {mine && playing ? "Pause" : "Play top tracks"}
    </button>
  );
}

/**
 * Each track is a band whose length matches its real running time,
 * like the grooves on a record side.
 */
export function TrackList({ tracks, artistId }: { tracks: Track[]; artistId: number }) {
  const longest = Math.max(...tracks.map((t) => t.duration), 1);
  return (
    <ol className="divide-y divide-line border-y border-line">
      {tracks.map((t, i) => (
        <Row key={t.id} track={t} rank={i + 1} width={t.duration / longest} queue={tracks} artistId={artistId} delay={i * 60} />
      ))}
    </ol>
  );
}

function Row({
  track,
  rank,
  width,
  queue,
  artistId,
  delay,
}: {
  track: Track;
  rank: number;
  width: number;
  queue: Track[];
  artistId: number;
  delay: number;
}) {
  const { now, playing, play } = usePlayer();
  const active = now?.track.id === track.id;
  const progress = useProgress(active);
  const query = `${track.artist} ${track.title}`;

  return (
    <li className={`group grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 py-3 sm:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1.1fr)_auto] sm:gap-x-5 ${active ? "text-ivory" : ""}`}>
      <button
        type="button"
        disabled={!track.preview}
        onClick={() => play(track, queue, artistId)}
        aria-label={`${active && playing ? "Pause" : "Play"} preview of ${track.title}`}
        className={`relative grid size-11 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
          active ? "border-brass bg-brass text-shellac" : "border-line text-dust hover:border-ivory hover:text-ivory"
        }`}
      >
        <span className={`tabular-nums ${active ? "hidden" : "group-hover:hidden"} text-sm`}>{rank}</span>
        <span className={active ? "" : "hidden group-hover:block"}>
          <PlayIcon playing={active && playing} />
        </span>
      </button>

      <div className="min-w-0">
        <p className="truncate text-ivory">
          {track.title}
          {track.explicit && (
            <span className="ml-2 rounded-sm border border-line px-1 align-middle text-[0.65rem] text-dust" title="Explicit">
              E
            </span>
          )}
        </p>
        <p className="truncate text-sm text-dust">{track.album.title}</p>
      </div>

      {/* The groove: width = running time relative to the longest track. */}
      <div className="hidden items-center gap-3 sm:flex">
        <div className="relative h-2 flex-1">
          <div
            className="bar-in absolute inset-y-0 left-0 overflow-hidden rounded-full bg-ivory/15"
            style={{ width: `${width * 100}%`, animationDelay: `${delay}ms` }}
          >
            <div
              className="h-full origin-left rounded-full bg-brass"
              style={{ transform: `scaleX(${active ? progress : 0})` }}
            />
          </div>
        </div>
        <span className="w-10 text-right text-sm tabular-nums text-dust">{duration(track.duration)}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-dust">
        <span className="tabular-nums sm:hidden">{duration(track.duration)}</span>
        <a href={geniusSearch(query)} target="_blank" rel="noreferrer" className="hover:text-ivory">
          Lyrics
        </a>
        <a href={youtubeSearch(query)} target="_blank" rel="noreferrer" className="hover:text-ivory">
          Watch
        </a>
      </div>
    </li>
  );
}
