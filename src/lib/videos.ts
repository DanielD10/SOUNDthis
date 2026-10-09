import { cacheLife } from "next/cache";
import { DAY, getJSON, isMock } from "./http";
import * as mock from "./mock";
import type { Keyed, Video } from "./types";

// YouTube Data API v3. Each search costs 100 of the 10,000 daily quota units,
// so results are cached for a day.
type SearchRes = {
  items?: {
    id: { videoId?: string };
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: { high?: { url: string }; medium?: { url: string } };
    };
  }[];
};

// The API returns titles with HTML entities.
const decode = (s: string) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

async function fetchVideos(name: string, key: string): Promise<Video[]> {
  "use cache";
  cacheLife("days");
  const q = encodeURIComponent(`${name} official music video`);
  const res = await getJSON<SearchRes>(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&maxResults=6&q=${q}&key=${encodeURIComponent(key)}`,
    DAY,
  );
  return (res.items ?? [])
    .filter((i) => i.id.videoId)
    .map((i) => ({
      id: i.id.videoId!,
      title: decode(i.snippet.title),
      channel: decode(i.snippet.channelTitle),
      thumbnail: i.snippet.thumbnails.high?.url ?? i.snippet.thumbnails.medium?.url ?? "",
      published: i.snippet.publishedAt,
    }));
}

export async function getVideos(name: string): Promise<Keyed<Video[]>> {
  if (isMock()) return { status: "ok", data: mock.videos };
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { status: "no-key" };
  try {
    return { status: "ok", data: await fetchVideos(name, key) };
  } catch (err) {
    console.error("[videos]", err instanceof Error ? err.message : err);
    return { status: "error" };
  }
}
