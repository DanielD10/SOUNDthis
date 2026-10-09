import { cacheLife } from "next/cache";
import { DAY, getJSON, isMock } from "./http";
import * as mock from "./mock";
import type { Bio } from "./types";

type SearchRes = { query?: { search?: { title: string }[] } };
type Summary = {
  type: string;
  title: string;
  description?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
};

// A page only counts if Wikipedia describes it as a music act.
const MUSIC =
  /\b(singer|rapper|musician|band|group|duo|trio|dj|producer|songwriter|composer|vocalist|guitarist|pianist|drummer|orchestra|ensemble|recording artist|music)\b/i;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Best-effort bio. Returns null rather than guessing at the wrong person. */
export async function getBio(name: string): Promise<Bio | null> {
  "use cache";
  cacheLife("days");
  if (isMock()) return mock.bio;

  const search = await getJSON<SearchRes>(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=5&srsearch=${encodeURIComponent(
      `"${name}" (musician OR band OR singer OR rapper OR group)`,
    )}`,
    DAY,
  );
  const titles = (search.query?.search ?? []).map((s) => s.title);
  const want = norm(name);

  for (const title of titles.slice(0, 4)) {
    // "Drake (musician)" → "drake": the base title must be the artist's name.
    if (norm(title.replace(/\s*\(.*\)$/, "")) !== want) continue;
    const s = await getJSON<Summary>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      DAY,
    ).catch(() => null);
    if (!s || s.type !== "standard" || !s.extract) continue;
    if (!MUSIC.test(`${s.description ?? ""} ${s.extract.slice(0, 300)}`)) continue;
    return {
      title: s.title,
      description: s.description ?? null,
      extract: s.extract,
      url: s.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  }
  return null;
}
