import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-24 sm:px-8">
        <h1 className="max-w-[14ch] font-display text-name leading-[0.9] text-ivory">
          Nothing on this side of the record.
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg text-dust">
          That artist link doesn’t point to anyone in the catalog. Search for them by name instead.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-ivory px-6 py-3 text-shellac hover:bg-brass">
          Back to search
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
