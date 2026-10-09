import { cacheLife } from "next/cache";
import { HOUR, getJSON, isMock } from "./http";
import * as mock from "./mock";
import type { Keyed, Show } from "./types";

// Ticketmaster Discovery API. Free key: https://developer.ticketmaster.com
const API = "https://app.ticketmaster.com/discovery/v2";

type Attraction = { id: string; name: string };
type AttractionsRes = { _embedded?: { attractions?: Attraction[] } };
type Event = {
  id: string;
  name: string;
  url: string;
  dates: { start: { localDate?: string; localTime?: string } };
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      state?: { stateCode?: string };
      country?: { countryCode?: string };
    }[];
  };
};
type EventsRes = { _embedded?: { events?: Event[] } };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function fetchShows(name: string, key: string): Promise<Show[]> {
  "use cache";
  cacheLife("hours");
  const k = encodeURIComponent(key);

  // Match the artist as an attraction first, so "Low" doesn't pull every event with "low" in it.
  const found = await getJSON<AttractionsRes>(
    `${API}/attractions.json?apikey=${k}&classificationName=music&size=10&keyword=${encodeURIComponent(name)}`,
    HOUR,
  );
  const attraction = found._embedded?.attractions?.find((a) => norm(a.name) === norm(name));
  if (!attraction) return [];

  const res = await getJSON<EventsRes>(
    `${API}/events.json?apikey=${k}&attractionId=${attraction.id}&sort=date,asc&size=12`,
    HOUR,
  );
  return (res._embedded?.events ?? [])
    .filter((e) => e.dates.start.localDate)
    .map((e) => {
      const v = e._embedded?.venues?.[0];
      return {
        id: e.id,
        name: e.name,
        date: e.dates.start.localDate!,
        time: e.dates.start.localTime ?? null,
        venue: v?.name ?? null,
        city: v?.city?.name ?? null,
        region: v?.state?.stateCode ?? v?.country?.countryCode ?? null,
        url: e.url,
      };
    });
}

export async function getShows(name: string): Promise<Keyed<Show[]>> {
  if (isMock()) return { status: "ok", data: mock.shows };
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return { status: "no-key" };
  try {
    return { status: "ok", data: await fetchShows(name, key) };
  } catch (err) {
    console.error("[shows]", err instanceof Error ? err.message : err);
    return { status: "error" };
  }
}
