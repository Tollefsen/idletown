import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Idle Town - Small Projects Collection",
    template: "%s | Idle Town",
  },
  description:
    "A space where small projects come to idle. Play games, flip coins, and track time with custom calendars.",
  keywords: [
    "games",
    "projects",
    "zombies",
    "coin flipper",
    "calendar",
    "diary",
  ],
  authors: [{ name: "Idle Town" }],
  creator: "Idle Town",
  metadataBase: new URL("https://idle.town"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://idle.town",
    title: "Idle Town - Small Projects Collection",
    description:
      "A space where small projects come to idle. Play games, flip coins, and track time with custom calendars.",
    siteName: "Idle Town",
  },
  twitter: {
    card: "summary_large_image",
    title: "Idle Town - Small Projects Collection",
    description:
      "A space where small projects come to idle. Play games, flip coins, and track time with custom calendars.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
