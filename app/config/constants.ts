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
} as const;

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

export const PROJECTS = [
  {
    name: "Sanghefte 1.0",
    route: ROUTES.sanghefte1,
    order: 1,
    hidden: false,
    external: true,
  },
  {
    name: "Zombies",
    route: ROUTES.zombies,
    order: 2,
    hidden: true,
    external: false,
  },
  {
    name: "Calendar Diary",
    route: ROUTES.calendarDiary,
    order: 3,
    hidden: false,
    external: false,
  },
  {
    name: "Coin Flipper",
    route: ROUTES.coinflipper,
    order: 4,
    hidden: false,
    external: false,
  },
  {
    name: "Sketchbook",
    route: ROUTES.sketchbook,
    order: 5,
    hidden: false,
    external: false,
  },
  {
    name: "Music Quiz",
    route: ROUTES.musicQuiz,
    order: 6,
    hidden: false,
    external: false,
  },
  {
    name: "Rock Paper Scissors",
    route: ROUTES.rockPaperScissors,
    order: 7,
    hidden: false,
    external: false,
  },
  {
    name: "Sanghefte 2.0",
    route: ROUTES.sanghefte2,
    order: 8,
    hidden: false,
    external: false,
  },
  {
    name: "Design System",
    route: "/design-system",
    order: 9,
    hidden: true,
    external: false,
  },
] as const;

export const STORAGE_KEYS = {
  calendarDiaryCalendars: "calendar-diary-calendars",
  calendarDiaryEntries: "calendar-diary-entries",
  sangheftePamphlets: "sanghefte-pamphlets",
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
