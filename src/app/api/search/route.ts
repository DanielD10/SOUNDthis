import { searchArtists } from "@/lib/deezer";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  try {
    const artists = await searchArtists(q, 6);
    return Response.json({ artists });
  } catch (err) {
    console.error("[api/search]", err instanceof Error ? err.message : err);
    return Response.json({ artists: [], error: "Search is unavailable right now." }, { status: 502 });
  }
}
