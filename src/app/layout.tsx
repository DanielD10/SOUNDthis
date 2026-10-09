import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter-tight";
import "./globals.css";
import { PlayerProvider } from "@/components/player";

export const metadata: Metadata = {
  title: { default: "SOUNDthis", template: "%s | SOUNDthis" },
  description:
    "Look up any artist: hear previews of their top tracks, browse the discography, find upcoming shows, and watch videos.",
};

export const viewport: Viewport = { themeColor: "#16110f" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
