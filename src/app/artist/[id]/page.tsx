import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Cover } from "@/components/cover";
import { Discography } from "@/components/discography";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PlayAll, TrackList } from "@/components/track-list";
import { VideoGrid } from "@/components/video-grid";
import { getArtist, getRelated, getReleases, getTopTracks } from "@/lib/deezer";
import { compact, showDate, showTime } from "@/lib/format";
import { songkickSearch, youtubeSearch } from "@/lib/links";
import { getShows } from "@/lib/shows";
import type { Artist } from "@/lib/types";
import { getVideos } from "@/lib/videos";
import { getBio } from "@/lib/wiki";

type Props = { params: Promise<{ id: string }> };

const parseId = (raw: string) => (/^\d{1,12}$/.test(raw) ? Number(raw) : null);

async function loadArtist(params: Props["params"]): Promise<Artist> {
  const id = parseId((await params).id);
  if (id === null) notFound();
  const artist = await getArtist(id);
  if (!artist) notFound();
  return artist;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const artist = id === null ? null : await getArtist(id).catch(() => null);
  if (!artist) return { title: "Artist not found" };
  return {
    title: artist.name,
    description: `Top tracks, releases, upcoming shows and videos for ${artist.name}.`,
    openGraph: artist.pictureLarge ? { images: [artist.pictureLarge] } : undefined,
  };
}

export default function ArtistPage({ params }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <Suspense fallback={<HeroSkeleton />}>
        <ArtistBody params={params} />
      </Suspense>
      <SiteFooter />
    </div>
  );
}

async function ArtistBody({ params }: Props) {
  const artist = await loadArtist(params);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-8">
      <Hero artist={artist} />

      <Section title="Top tracks" note="Tap a track for a 30-second preview.">
        <Suspense fallback={<Rows />}>
          <TopTracks id={artist.id} />
        </Suspense>
      </Section>

      <Section title="Releases">
        <Suspense fallback={<Tiles />}>
          <Releases id={artist.id} />
        </Suspense>
      </Section>

      <Section title="On tour">
        <Suspense fallback={<Rows n={3} />}>
          <Shows name={artist.name} />
        </Suspense>
      </Section>

      <Section title="Videos">
        <Suspense fallback={<Tiles n={2} wide />}>
          <Videos name={artist.name} />
        </Suspense>
      </Section>

      <Section title="About">
        <Suspense fallback={<Rows n={2} />}>
          <About name={artist.name} />
        </Suspense>
      </Section>

      <Section title="Fans also play">
        <Suspense fallback={<Tiles n={4} />}>
          <Related id={artist.id} />
        </Suspense>
      </Section>
    </main>
  );
}

function Hero({ artist }: { artist: Artist }) {
  return (
    <section className="grid gap-8 pb-20 pt-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end md:gap-12 md:pt-20">
      <Cover
        src={artist.pictureLarge}
        name={artist.name}
        large
        className="aspect-square w-full max-w-md rounded-sm md:max-w-none"
      />
      <div>
        <h1 className="break-words font-display text-name leading-[0.88] tracking-[-0.02em] text-ivory [hyphens:auto]">
          {artist.name}
        </h1>
        <p className="mt-6 text-lg text-dust">
          {compact(artist.fans)} fans on Deezer, {artist.albums} releases
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Suspense fallback={<div className="h-12 w-48 rounded-full bg-groove" />}>
            <HeroPlay id={artist.id} />
          </Suspense>
          <a href={artist.link} target="_blank" rel="noreferrer" className="text-dust hover:text-ivory">
            Open in Deezer
          </a>
        </div>
      </div>
    </section>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="font-display text-4xl leading-none text-ivory">{title}</h2>
        {note && <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-dust">{note}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Unavailable({ what }: { what: string }) {
  return <p className="text-dust">{what} didn’t load. Refresh the page to try again.</p>;
}

/* ---------- sections ---------- */

async function HeroPlay({ id }: { id: number }) {
  const tracks = await getTopTracks(id).catch(() => []);
  return <PlayAll tracks={tracks} artistId={id} />;
}

async function TopTracks({ id }: { id: number }) {
  const tracks = await getTopTracks(id).catch(() => null);
  if (!tracks) return <Unavailable what="Top tracks" />;
  if (!tracks.length) return <p className="text-dust">No tracks are listed for this artist yet.</p>;
  return <TrackList tracks={tracks} artistId={id} />;
}

async function Releases({ id }: { id: number }) {
  const releases = await getReleases(id).catch(() => null);
  if (!releases) return <Unavailable what="Releases" />;
  if (!releases.length) return <p className="text-dust">No releases are listed yet.</p>;
  return <Discography releases={releases} />;
}

async function Shows({ name }: { name: string }) {
  const res = await getShows(name);
  const elsewhere = (
    <a href={songkickSearch(name)} target="_blank" rel="noreferrer" className="text-ivory underline decoration-line underline-offset-4 hover:decoration-brass">
      Check dates on Songkick
    </a>
  );

  if (res.status !== "ok" || res.data.length === 0) {
    return (
      <p className="text-dust">
        {res.status === "ok" ? "No upcoming shows on Ticketmaster. " : ""}
        {elsewhere}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {res.data.map((s) => {
        const d = showDate(s.date);
        const time = showTime(s.time);
        return (
          <li key={s.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 sm:gap-6">
            <div className="text-center leading-none">
              <p className="text-sm text-dust">{d.month}</p>
              <p className="mt-1 font-display text-4xl text-ivory">{d.day}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-ivory">{s.venue ?? s.name}</p>
              <p className="truncate text-sm text-dust">
                {[s.city, s.region].filter(Boolean).join(", ")}
                {`, ${d.weekday}`}
                {time && ` at ${time}`}
              </p>
            </div>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-4 py-2 text-sm text-ivory hover:border-brass hover:text-brass"
            >
              Tickets
            </a>
          </li>
        );
      })}
    </ul>
  );
}

async function Videos({ name }: { name: string }) {
  const res = await getVideos(name);
  const search = (
    <a href={youtubeSearch(name)} target="_blank" rel="noreferrer" className="text-ivory underline decoration-line underline-offset-4 hover:decoration-brass">
      Watch {name} on YouTube
    </a>
  );
  if (res.status !== "ok" || res.data.length === 0) return <p className="text-dust">{search}</p>;
  return (
    <div>
      <VideoGrid videos={res.data} />
      <p className="mt-8 text-dust">{search}</p>
    </div>
  );
}

async function About({ name }: { name: string }) {
  const bio = await getBio(name).catch(() => null);
  if (!bio) {
    return <p className="text-dust">Wikipedia doesn’t have a page we could match to this artist.</p>;
  }
  return (
    <div className="max-w-[62ch]">
      {bio.description && <p className="font-display text-2xl italic text-ivory">{bio.description}</p>}
      <p className="mt-4 text-lg leading-[1.7] text-ivory/85">{bio.extract}</p>
      <a href={bio.url} target="_blank" rel="noreferrer" className="mt-6 inline-block text-dust hover:text-ivory">
        Read more on Wikipedia
      </a>
    </div>
  );
}

async function Related({ id }: { id: number }) {
  const related = await getRelated(id).catch(() => []);
  if (!related.length) return <p className="text-dust">No similar artists listed.</p>;
  return (
    <ul className="scrollbar-none -mx-4 flex gap-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {related.map((a) => (
        <li key={a.id} className="w-32 shrink-0 sm:w-36">
          <Link href={`/artist/${a.id}`} className="group block">
            <Cover src={a.picture} name={a.name} className="aspect-square w-full rounded-full" />
            <p className="mt-3 truncate text-ivory group-hover:text-brass">{a.name}</p>
            <p className="text-sm text-dust">{compact(a.fans)} fans</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- skeletons ---------- */

function HeroSkeleton() {
  return (
    <main aria-busy className="mx-auto w-full max-w-6xl flex-1 animate-pulse px-4 sm:px-8">
      <div className="grid gap-8 pb-20 pt-12 md:grid-cols-[5fr_7fr] md:items-end md:gap-12 md:pt-20">
        <div className="aspect-square w-full max-w-md rounded-sm bg-groove md:max-w-none" />
        <div>
          <div className="h-28 w-3/4 rounded bg-groove" />
          <div className="mt-6 h-5 w-64 rounded bg-groove" />
        </div>
      </div>
    </main>
  );
}

function Rows({ n = 6 }: { n?: number }) {
  return (
    <div aria-busy className="animate-pulse divide-y divide-line border-y border-line">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="size-11 rounded-full bg-groove" />
          <div className="h-4 flex-1 rounded bg-groove" />
        </div>
      ))}
    </div>
  );
}

function Tiles({ n = 8, wide = false }: { n?: number; wide?: boolean }) {
  return (
    <div aria-busy className={`grid animate-pulse gap-5 ${wide ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className={`${wide ? "aspect-video" : "aspect-square"} rounded-sm bg-groove`} />
      ))}
    </div>
  );
}
