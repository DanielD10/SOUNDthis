"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-8">
      <h1 className="max-w-[16ch] font-display text-5xl leading-tight text-ivory">
        The music catalog didn’t respond.
      </h1>
      <p className="mt-4 text-dust">This is usually brief. Try again, or go back and search.</p>
      <div className="mt-8 flex gap-6">
        <button type="button" onClick={reset} className="rounded-full bg-ivory px-6 py-3 text-shellac hover:bg-brass">
          Try again
        </button>
        <Link href="/" className="self-center text-dust hover:text-ivory">
          Back to search
        </Link>
      </div>
    </main>
  );
}
