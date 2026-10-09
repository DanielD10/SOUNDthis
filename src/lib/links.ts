// Outbound search links. Pure helpers, safe for client components.
export const youtubeSearch = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const geniusSearch = (q: string) => `https://genius.com/search?q=${encodeURIComponent(q)}`;
export const songkickSearch = (q: string) =>
  `https://www.songkick.com/search?type=artists&query=${encodeURIComponent(q)}`;
