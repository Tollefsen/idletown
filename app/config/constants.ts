export const SITE = {
  name: "Idle Town",
  url: "https://idle.town",
  description: "A space where small projects come to idle.",
} as const;

export const ROUTES = {
  home: "/",
  coinflipper: "/coinflipper",
  sketchbook: "/sketchbook",
  calendarDiary: "/calendar-diary",
  musicQuiz: "/music-quiz",
  rockPaperScissors: "/rock-paper-scissors",
  zombies: "/zombies",
  sanghefte1: "https://sanghefte.no",
  sanghefte2: "/sanghefte/rediger",
  tilesetTool: "/tileset-tool",
  cashflowMonteCarlo: "/cashflow-monte-carlo",
  sampleSizeCalculator: "/sample-size-calculator",
  yearOfVibe: "/year-of-vibe",
  sudoku: "/sudoku",
} as const;

export const PROJECT_CATEGORIES = [
  "game",
  "tool",
  "utility",
  "creative",
  "experiment",
  "dashboard",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = "active" | "complete" | "wip";

export interface Project {
  name: string;
  route: string;
  createdAt: string;
  hidden: boolean;
  external: boolean;
  description?: string;
  category?: ProjectCategory[];
  status?: ProjectStatus;
}

export const LIMITS = {
  qrCapacity: 3391,
  youtubePlayerTimeout: 3000,
  iceGatheringTimeout: 5000, // Reduced from 10s to 5s - relay candidates typically arrive within 2-3s if TURN works
} as const;

export const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  // Multiple free TURN server options
  // Note: For production, replace with your own TURN server for reliability
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:80?transport=tcp",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  // Alternative free TURN server from Numb
  {
    urls: "turn:numb.viagenie.ca",
    username: "webrtc@live.com",
    credential: "muazkh",
  },
  // Alternative free TURN servers
  {
    urls: [
      "turn:a.relay.metered.ca:80",
      "turn:a.relay.metered.ca:80?transport=tcp",
      "turn:a.relay.metered.ca:443",
      "turn:a.relay.metered.ca:443?transport=tcp",
    ],
    username: "987eff4e1f350cdd4541d5eb",
    credential: "uBDaNB6+xbDYFwBP",
  },
];

export const PROJECTS: Project[] = [
  {
    name: "Sanghefte 1.0",
    route: ROUTES.sanghefte1,
    createdAt: "2020-01-01",
    hidden: false,
    external: true,
    description: "The original digital songbook for gatherings",
    category: ["creative", "utility"],
    status: "complete",
  },
  {
    name: "Zombies",
    route: ROUTES.zombies,
    createdAt: "2025-07-24",
    hidden: true,
    external: false,
    description: "2D top-down survival shooter built with Kaplay",
    category: ["game"],
    status: "wip",
  },
  {
    name: "Calendar Diary",
    route: ROUTES.calendarDiary,
    createdAt: "2025-10-08",
    hidden: false,
    external: false,
    description: "Custom calendar with integrated diary entries",
    category: ["tool", "utility"],
    status: "complete",
  },
  {
    name: "Coin Flipper",
    route: ROUTES.coinflipper,
    createdAt: "2025-10-11",
    hidden: false,
    external: false,
    description: "Animated coin flip for quick decisions",
    category: ["game", "experiment"],
    status: "complete",
  },
  {
    name: "Sketchbook",
    route: ROUTES.sketchbook,
    createdAt: "2025-10-26",
    hidden: false,
    external: false,
    description: "Canvas drawing app with QR code sharing",
    category: ["creative", "tool"],
    status: "complete",
  },
  {
    name: "Music Quiz",
    route: ROUTES.musicQuiz,
    createdAt: "2025-10-26",
    hidden: false,
    external: false,
    description: "YouTube-based music guessing game",
    category: ["game", "creative"],
    status: "complete",
  },
  {
    name: "Rock Paper Scissors",
    route: ROUTES.rockPaperScissors,
    createdAt: "2025-10-31",
    hidden: false,
    external: false,
    description: "Real-time multiplayer via WebRTC",
    category: ["game", "experiment"],
    status: "complete",
  },
  {
    name: "Sanghefte 2.0",
    route: ROUTES.sanghefte2,
    createdAt: "2025-12-25",
    hidden: false,
    external: false,
    description: "Redesigned songbook with pamphlet editor",
    category: ["creative", "utility"],
    status: "complete",
  },
  {
    name: "Design System",
    route: "/design-system",
    createdAt: "2025-12-27",
    hidden: true,
    external: false,
    description: "Reusable UI component library for Idle Town",
    category: ["tool"],
    status: "active",
  },
  {
    name: "Tileset Tool",
    route: ROUTES.tilesetTool,
    createdAt: "2025-12-27",
    hidden: false,
    external: false,
    description: "Pixel art tileset editor with auto-tiling rules",
    category: ["tool", "creative", "game"],
    status: "wip",
  },
  {
    name: "Cash Flow Monte Carlo",
    route: ROUTES.cashflowMonteCarlo,
    createdAt: "2025-12-28",
    hidden: false,
    external: false,
    description:
      "Financial projection simulator with probability distributions",
    category: ["tool", "utility"],
    status: "complete",
  },
  {
    name: "Sample Size Calculator",
    route: ROUTES.sampleSizeCalculator,
    createdAt: "2026-01-07",
    hidden: false,
    external: false,
    description: "A/B test sample size and duration estimator",
    category: ["tool", "utility"],
    status: "complete",
  },
  {
    name: "Year of Vibe",
    route: ROUTES.yearOfVibe,
    createdAt: "2026-01-07",
    hidden: true,
    external: false,
    description: "Personal dashboard tracking 52 projects in 2026",
    category: ["dashboard"],
    status: "active",
  },
  {
    name: "Sudoku Analyzer",
    route: ROUTES.sudoku,
    createdAt: "2026-01-21",
    hidden: false,
    external: false,
    description: "Analyze Sudoku puzzle difficulty based on solving techniques",
    category: ["tool", "game"],
    status: "complete",
  },
];

export const STORAGE_KEYS = {
  calendarDiaryCalendars: "calendar-diary-calendars",
  calendarDiaryEntries: "calendar-diary-entries",
  sangheftePamphlets: "sanghefte-pamphlets",
  tilesetToolTiles: "tileset-tool-tiles",
  cashflowMonteCarloScenarios: "cashflow-monte-carlo-scenarios",
  sampleSizeScenarios: "sample-size-calculator-scenarios",
} as const;

export const MESSAGES = {
  errors: {
    qrGenerationFailed:
      "Failed to generate QR code. Drawing may be too detailed.",
    drawingTooDetailed: (length: number, max: number) =>
      `Drawing is too detailed (${length} chars, max ${max}). Try a simpler drawing.`,
    webrtcOfferFailed: "Failed to accept offer:",
    webrtcAnswerFailed: "Failed to accept answer:",
    parseMessageFailed: "Failed to parse message:",
  },
  confirmations: {
    deleteCalendar:
      "Are you sure you want to delete this calendar? All diary entries will be lost.",
  },
} as const;
