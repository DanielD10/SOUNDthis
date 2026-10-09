import { initials } from "@/lib/format";

/** Artwork with a typographic fallback when a source has no image. */
export function Cover({
  src,
  name,
  className = "",
  large = false,
}: {
  src: string | null;
  name: string;
  className?: string;
  large?: boolean;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className={`bg-groove object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`grid place-items-center bg-groove font-display text-dust ${
        large ? "text-[clamp(4rem,12vw,9rem)]" : "text-lg"
      } ${className}`}
    >
      {initials(name)}
    </div>
  );
}
