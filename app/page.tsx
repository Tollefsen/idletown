import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Idle Town - a collection of small projects including games, tools, and experiments.",
  openGraph: {
    title: "Idle Town - Home",
    description:
      "Welcome to Idle Town - a collection of small projects including games, tools, and experiments.",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl text-center px-4">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
            Welcome to Idle Town
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-gray-600 dark:text-gray-400">
            A space where small projects come to idle
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/zombies"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Play Zombies
            </Link>
            <Link
              href="/coinflipper"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Coin Flipper
            </Link>
            <Link
              href="/sketchbook"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Sketchbook
            </Link>
            <Link
              href="/calendar-diary"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Calendar Diary
            </Link>
            <Link
              href="/music-quiz"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Music Quiz
            </Link>
            <a
              href="https://sanghefte.no"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6"
            >
              Sanghefte ↗
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/[.08] dark:border-white/[.145] p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Idle Town
      </footer>
    </div>
  );
}
