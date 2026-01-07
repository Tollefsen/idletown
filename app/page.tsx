import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "./components/Card";
import { PROJECTS, SITE } from "./config/constants";

export const metadata: Metadata = {
  title: "Home",
  description: `Welcome to ${SITE.name} - a collection of small projects including games, tools, and experiments.`,
  openGraph: {
    title: `${SITE.name} - Home`,
    description: `Welcome to ${SITE.name} - a collection of small projects including games, tools, and experiments.`,
  },
};

const visibleProjects = PROJECTS.filter((p) => !p.hidden).toSorted(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8">
        <div className="max-w-3xl w-full text-center px-4">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
            Welcome to {SITE.name}
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-gray-600 dark:text-gray-400">
            {SITE.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProjects.map((project) =>
              project.external ? (
                <a
                  key={project.name}
                  href={project.route}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card
                    variant="outlined"
                    padding="lg"
                    className="h-full transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    <span className="font-medium text-lg">
                      {project.name} ↗
                    </span>
                  </Card>
                </a>
              ) : (
                <Link key={project.name} href={project.route}>
                  <Card
                    variant="outlined"
                    padding="lg"
                    className="h-full transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    <span className="font-medium text-lg">{project.name}</span>
                  </Card>
                </Link>
              ),
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-black/[.08] dark:border-white/[.145] p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-center gap-4">
          <span>{SITE.name}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/year-of-vibe"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Year of Vibe
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/design-system"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Design System
          </Link>
        </div>
      </footer>
    </div>
  );
}
