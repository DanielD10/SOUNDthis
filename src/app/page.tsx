import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { Wordmark } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const TRY = ["Khruangbin", "SZA", "Radiohead", "Bad Bunny", "Selena", "Leon Bridges"];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-8">
        <Wordmark className="text-3xl" />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-24 pt-16 sm:px-8">
        <h1 className="max-w-[11ch] font-display text-hero leading-[0.86] tracking-[-0.02em] text-ivory">
          Who are you listening to?
        </h1>
        <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-dust">
          Type a name. Hear their top tracks, flip through every release, and see where they’re
          playing next.
        </p>
        <div className="mt-12 max-w-2xl">
          <SearchBox autoFocus />
        </div>
        <p className="mt-6 max-w-2xl text-dust">
          Or start with{" "}
          {TRY.map((name, i) => (
            <span key={name}>
              <Link
                href={`/search?q=${encodeURIComponent(name)}`}
                className="text-ivory underline decoration-line underline-offset-4 hover:decoration-brass"
              >
                {name}
              </Link>
              {i < TRY.length - 2 ? ", " : i === TRY.length - 2 ? ", or " : "."}
            </span>
          ))}
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
