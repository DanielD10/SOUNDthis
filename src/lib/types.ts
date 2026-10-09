export type ArtistHit = {
  id: number;
  name: string;
  picture: string | null;
  fans: number;
  albums: number;
};

export type Artist = ArtistHit & {
  pictureLarge: string | null;
  link: string;
};

export type Track = {
  id: number;
  title: string;
  duration: number; // seconds
  preview: string | null; // 30s mp3
  explicit: boolean;
  album: { id: number; title: string; cover: string | null };
  artist: string;
  link: string;
};

export type ReleaseKind = "album" | "single" | "ep" | "compile";

export type Release = {
  id: number;
  title: string;
  cover: string | null;
  released: string | null; // YYYY-MM-DD
  kind: ReleaseKind;
  link: string;
};

export type Bio = {
  title: string;
  description: string | null;
  extract: string;
  url: string;
};

export type Show = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  venue: string | null;
  city: string | null;
  region: string | null;
  url: string;
};

export type Video = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  published: string;
};

/** Data that depends on an optional API key reports whether the key exists. */
export type Keyed<T> =
  | { status: "ok"; data: T }
  | { status: "no-key" }
  | { status: "error" };
