// Offline fixtures, used when SOUNDTHIS_MOCK=1. Fictional artist, no network.
import type { Artist, ArtistHit, Bio, Release, Show, Track, Video } from "./types";

// Drop any mp3 at public/mock/preview.mp3 to hear the player offline (gitignored).
const PREVIEW = "/mock/preview.mp3";

const artist: Artist = {
  id: 1,
  name: "Night Atlas",
  picture: null,
  pictureLarge: null,
  fans: 284_113,
  albums: 9,
  link: "https://www.deezer.com",
};

export const related: ArtistHit[] = [
  { id: 2, name: "Copper Lanes", picture: null, fans: 91_200, albums: 4 },
  { id: 3, name: "Marisol Vega", picture: null, fans: 1_204_551, albums: 6 },
  { id: 4, name: "The Low Orchard", picture: null, fans: 44_018, albums: 3 },
  { id: 5, name: "Saint Ferro", picture: null, fans: 512_900, albums: 7 },
  { id: 6, name: "Hollis Grey", picture: null, fans: 18_442, albums: 2 },
];

export function searchArtists(q: string): ArtistHit[] {
  const all = [artist, ...related];
  const n = q.toLowerCase();
  return all.filter((a) => a.name.toLowerCase().includes(n));
}

export const getArtist = (id: number): Artist | null => {
  if (id === 1) return artist;
  const r = related.find((a) => a.id === id);
  return r ? { ...r, pictureLarge: null, link: "https://www.deezer.com" } : null;
};

const t = (id: number, title: string, duration: number, album: string): Track => ({
  id,
  title,
  duration,
  preview: PREVIEW,
  explicit: id === 104,
  album: { id: 10, title: album, cover: null },
  artist: artist.name,
  link: "https://www.deezer.com",
});

export const topTracks: Track[] = [
  t(101, "Lantern Weather", 243, "Salt Roads"),
  t(102, "Ninety Miles of Static", 318, "Salt Roads"),
  t(103, "Paper Moon Motel", 187, "Glass Hours"),
  t(104, "Overpass", 412, "Glass Hours"),
  t(105, "Halfway to Marfa", 266, "Salt Roads"),
  t(106, "Blue Hour Radio", 201, "Night Atlas"),
  t(107, "Tin Roof", 154, "Night Atlas"),
];

export const releases: Release[] = [
  { id: 10, title: "Salt Roads", cover: null, released: "2026-03-14", kind: "album", link: "#" },
  { id: 11, title: "Overpass (Live at Mohawk)", cover: null, released: "2025-11-02", kind: "single", link: "#" },
  { id: 12, title: "Glass Hours", cover: null, released: "2024-06-21", kind: "album", link: "#" },
  { id: 13, title: "Tin Roof Sessions", cover: null, released: "2023-09-08", kind: "ep", link: "#" },
  { id: 14, title: "Paper Moon Motel", cover: null, released: "2023-04-01", kind: "single", link: "#" },
  { id: 15, title: "Night Atlas", cover: null, released: "2021-10-15", kind: "album", link: "#" },
];

export const bio: Bio = {
  title: "Night Atlas",
  description: "Fictional American indie rock band",
  extract:
    "Night Atlas is a fictional four-piece from San Antonio, Texas, used here as sample data. The band plays slow, reverb-heavy indie rock built around long drives and late-night radio. Their third album, Salt Roads, was recorded in a converted feed store outside Marfa.",
  url: "https://en.wikipedia.org",
};

export const shows: Show[] = [
  { id: "s1", name: "Night Atlas", date: "2026-11-06", time: "20:00:00", venue: "Paper Tiger", city: "San Antonio", region: "TX", url: "#" },
  { id: "s2", name: "Night Atlas", date: "2026-11-08", time: "19:30:00", venue: "Mohawk", city: "Austin", region: "TX", url: "#" },
  { id: "s3", name: "Night Atlas", date: "2026-11-12", time: "20:00:00", venue: "White Oak Music Hall", city: "Houston", region: "TX", url: "#" },
  { id: "s4", name: "Night Atlas with Copper Lanes", date: "2026-12-03", time: null, venue: "The Van Buren", city: "Phoenix", region: "AZ", url: "#" },
];

export const videos: Video[] = [];
