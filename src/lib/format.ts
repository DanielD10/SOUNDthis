export const duration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

export const year = (iso: string | null) => (iso ? iso.slice(0, 4) : "");

export const showDate = (iso: string) => ({
  month: asDate(iso).toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
  day: asDate(iso).getUTCDate(),
  weekday: asDate(iso).toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }),
});

export const showTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
};

export const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((w) => !/^(the|a|an)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
