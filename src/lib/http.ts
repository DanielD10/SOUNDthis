const UA = "SOUNDthis/1.0 (https://github.com/DanielD10/soundthis)";

/**
 * GET a JSON endpoint with a timeout and Next's persistent fetch cache.
 * Throws on network errors and non-2xx responses.
 */
export async function getJSON<T>(url: string, revalidate: number): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${new URL(url).host}`);
  return (await res.json()) as T;
}

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

export const isMock = () => process.env.SOUNDTHIS_MOCK === "1";
