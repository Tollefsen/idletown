import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Diary",
  description:
    "Create custom calendars and track diary entries. Supports multiple calendar systems including fantasy worlds.",
  openGraph: {
    title: "Calendar Diary | Idle Town",
    description:
      "Create custom calendars and track diary entries. Supports multiple calendar systems including fantasy worlds.",
  },
};

export default function CalendarDiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
