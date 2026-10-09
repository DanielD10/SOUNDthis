import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Cover } from "@/components/cover";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { searchArtists } from "@/lib/deezer";
import { compact } from "@/lib/format";
import type { ArtistHit } from "@/lib/types";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<SiteHeader />}>
        {searchParams.then((p) => (
          <SiteHeader query={one(p.q)} />
        ))}
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-16 sm:px-8">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function Results({ searchParams }: Props) {
  const q = one((await searchParams).q).slice(0, 80);
  if (!q) {
    return <h1 className="font-display text-5xl">Search for an artist to get started.</h1>;
  }

  let artists: ArtistHit[];
  try {
    artists = await searchArtists(q, 12);
  } catch {
    return (
      <div>
        <h1 className="font-display text-5xl">Search is unavailable right now.</h1>
        <p className="mt-4 text-dust">The music catalog didn’t respond. Try again in a minute.</p>
      </div>
    );
  }

  // A clean exact match (a "start with" link, or a typed full name) skips the list.
  if (artists[0] && norm(artists[0].name) === norm(q)) redirect(`/artist/${artists[0].id}`);

  if (artists.length === 0) {
    return (
      <div>
        <h1 className="font-display text-5xl">No artists match “{q}”.</h1>
        <p className="mt-4 text-dust">Check the spelling, or try a shorter part of the name.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-5xl">Artists matching “{q}”</h1>
      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((a) => (
          <li key={a.id}>
            <Link href={`/artist/${a.id}`} className="group block">
              <Cover src={a.picture} name={a.name} className="aspect-square w-full rounded-full" />
              <p className="mt-4 truncate text-lg text-ivory group-hover:text-brass">{a.name}</p>
              <p className="text-sm text-dust">{compact(a.fans)} fans</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-busy className="animate-pulse">
      <div className="h-12 w-80 rounded bg-groove" />
      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square rounded-full bg-groove" />
        ))}
      </div>
    </div>
  );
}
