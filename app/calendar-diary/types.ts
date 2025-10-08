export type CalendarConfig = {
  id: string;
  name: string;
  months: MonthConfig[];
};

export type MonthConfig = {
  name: string;
  days: number;
};

export type DiaryEntry = {
  calendarId: string;
  date: DateKey;
  content: string;
  updatedAt: number;
};

export type DateKey = string;
