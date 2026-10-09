export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-28 text-sm leading-relaxed text-dust sm:px-8">
      <div className="border-t border-line pt-8">
        <p className="max-w-[70ch]">
          Previews and releases from Deezer. Bios from Wikipedia. Shows from Ticketmaster. Videos
          from YouTube. Lyrics open on Genius. Built by{" "}
          <a href="https://github.com/DanielD10" className="text-ivory hover:text-brass">
            Daniel Duran
          </a>
          .
        </p>
        <p className="mt-3 max-w-[70ch]">
          Rebuilt from a{" "}
          <a href="https://github.com/Brian-Fairbanks/SoundThis" className="text-ivory hover:text-brass">
            class project
          </a>{" "}
          made with Brian Fairbanks, Surge, and Will.
        </p>
      </div>
    </footer>
  );
}
