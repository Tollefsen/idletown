import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h2 className="text-5xl font-bold mb-6">Welcome to Idle Town</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
            A space where small projects come to idle
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/zombies"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-6"
            >
              Play Zombies
            </Link>
            <Link
              href="/calendar-diary"
              className="relative rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-12 px-6 opacity-50"
            >
              Calendar Diary
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                WIP
              </span>
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
