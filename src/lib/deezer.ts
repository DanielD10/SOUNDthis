import { cacheLife } from "next/cache";
import { DAY, HOUR, getJSON, isMock } from "./http";
import * as mock from "./mock";
import type { Artist, ArtistHit, Release, ReleaseKind, Track } from "./types";

// Deezer's public API: no key, no auth. Errors come back as 200 + { error }.
const API = "https://api.deezer.com";

type DzError = { error?: { type: string; message: string; code: number } };
type DzList<T> = DzError & { data?: T[] };

type DzArtist = {
  id: number;
  name: string;
  link: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  nb_album?: number;
  nb_fan?: number;
};

type DzTrack = {
  id: number;
  title: string;
  title_short?: string;
  duration: number;
  preview?: string;
  link: string;
  explicit_lyrics?: boolean;
  artist: { name: string };
  album: { id: number; title: string; cover_medium?: string };
};

type DzAlbum = {
  id: number;
  title: string;
  link: string;
  cover_medium?: string;
  cover_big?: string;
  release_date?: string;
  record_type?: string;
};

async function dz<T extends object>(path: string, revalidate: number): Promise<T> {
  const body = await getJSON<T & DzError>(`${API}${path}`, revalidate);
  if (body.error) throw new Error(`Deezer: ${body.error.message}`);
  return body;
}

// Deezer serves a generic grey silhouette when an artist has no photo.
const real = (url?: string) => (url && !/\/artist\/\/|images\/artist\/\//.test(url) ? url : null);

const toHit = (a: DzArtist): ArtistHit => ({
  id: a.id,
  name: a.name,
  picture: real(a.picture_medium),
  fans: a.nb_fan ?? 0,
  albums: a.nb_album ?? 0,
});

export async function searchArtists(q: string, limit = 8): Promise<ArtistHit[]> {
  "use cache";
  cacheLife("hours");
  const query = q.trim();
  if (!query) return [];
  if (isMock()) return mock.searchArtists(query);
  const body = await dz<DzList<DzArtist>>(
    `/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`,
    HOUR,
  );
  return (body.data ?? []).map(toHit);
}

/** Returns null when the id doesn't exist, so the page can 404. */
export async function getArtist(id: number): Promise<Artist | null> {
  "use cache";
  cacheLife("hours");
  if (isMock()) return mock.getArtist(id);
  try {
    const a = await dz<DzArtist>(`/artist/${id}`, HOUR);
    return { ...toHit(a), pictureLarge: real(a.picture_xl ?? a.picture_big), link: a.link };
  } catch (err) {
    if (err instanceof Error && /no data/i.test(err.message)) return null;
    throw err;
  }
}

export async function getTopTracks(id: number, limit = 10): Promise<Track[]> {
  "use cache";
  cacheLife("hours");
  if (isMock()) return mock.topTracks;
  const body = await dz<DzList<DzTrack>>(`/artist/${id}/top?limit=${limit}`, HOUR);
  return (body.data ?? []).map((t) => ({
    id: t.id,
    title: t.title_short || t.title,
    duration: t.duration,
    preview: t.preview || null,
    explicit: Boolean(t.explicit_lyrics),
    album: { id: t.album.id, title: t.album.title, cover: t.album.cover_medium ?? null },
    artist: t.artist.name,
    link: t.link,
  }));
}

const KINDS: ReleaseKind[] = ["album", "single", "ep", "compile"];

export async function getReleases(id: number): Promise<Release[]> {
  "use cache";
  cacheLife("days");
  if (isMock()) return mock.releases;
  const body = await dz<DzList<DzAlbum>>(`/artist/${id}/albums?limit=100`, DAY);
  const seen = new Set<string>();
  return (body.data ?? [])
    .map((r) => ({
      id: r.id,
      title: r.title,
      cover: r.cover_big ?? r.cover_medium ?? null,
      released: r.release_date ?? null,
      kind: (KINDS as string[]).includes(r.record_type ?? "")
        ? (r.record_type as ReleaseKind)
        : "album",
      link: r.link,
    }))
    // Deezer lists regional/deluxe duplicates; keep the first of each title+kind.
    .filter((r) => {
      const key = `${r.kind}:${r.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.released ?? "").localeCompare(a.released ?? ""));
}

export async function getRelated(id: number, limit = 8): Promise<ArtistHit[]> {
  "use cache";
  cacheLife("days");
  if (isMock()) return mock.related;
  const body = await dz<DzList<DzArtist>>(`/artist/${id}/related?limit=${limit}`, DAY);
  return (body.data ?? []).map(toHit);
}
