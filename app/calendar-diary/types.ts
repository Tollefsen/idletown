export type CalendarConfig = {
  id: string;
  name: string;
  months: MonthConfig[];
  leapYearRule?: LeapYearRule;
  useEras?: boolean;
  eraNames?: {
    before: string;
    after: string;
  };
};

export type MonthConfig = {
  name: string;
  days: number;
  leapYearDays?: number;
};

export type LeapYearRule = {
  type: "none" | "gregorian" | "custom";
  customRule?: (year: number) => boolean;
};

export type DiaryEntry = {
  calendarId: string;
  date: DateKey;
  content: string;
  updatedAt: number;
};

export type DateKey = string;
