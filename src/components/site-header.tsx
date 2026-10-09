import Link from "next/link";
import { SearchBox } from "./search-box";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-tight ${className}`}>
      <span className="text-ivory">SOUND</span>
      <span className="italic text-brass">this</span>
    </span>
  );
}

export function SiteHeader({ query = "" }: { query?: string }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 pt-6 sm:px-8">
      <Link href="/" aria-label="SOUNDthis home" className="shrink-0 text-3xl">
        <Wordmark />
      </Link>
      <div className="ml-auto w-full max-w-sm">
        <SearchBox size="sm" defaultValue={query} />
      </div>
    </header>
  );
}
