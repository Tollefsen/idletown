export const SITE = {
  name: "Idle Town",
  url: "https://idle.town",
  description:
    "A space where small projects come to idle. Play games, flip coins, and track time with custom calendars.",
} as const;

export const ROUTES = {
  home: "/",
  coinflipper: "/coinflipper",
  sketchbook: "/sketchbook",
  calendarDiary: "/calendar-diary",
  musicQuiz: "/music-quiz",
  rockPaperScissors: "/rock-paper-scissors",
  zombies: "/zombies",
  sanghefte: "https://sanghefte.no",
} as const;

export const LIMITS = {
  qrCapacity: 3391,
  youtubePlayerTimeout: 3000,
  iceGatheringTimeout: 3000,
} as const;

export const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // Free TURN server from metered.ca (limited usage)
  // For production, replace with your own TURN server
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export const STORAGE_KEYS = {
  calendarDiaryCalendars: "calendar-diary-calendars",
  calendarDiaryEntries: "calendar-diary-entries",
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
