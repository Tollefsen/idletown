import { describe, expect, it } from "vitest";
import { CALENDAR_TEMPLATES } from "./templates";

describe("CALENDAR_TEMPLATES", () => {
  it("should contain all expected calendar templates", () => {
    const templateKeys = Object.keys(CALENDAR_TEMPLATES);

    expect(templateKeys).toContain("gregorian");
    expect(templateKeys).toContain("harptos");
    expect(templateKeys).toContain("eberron");
    expect(templateKeys).toContain("exandrian");
    expect(templateKeys).toContain("golarion");
    expect(templateKeys).toContain("imperial");
    expect(templateKeys).toContain("tamrielic");
    expect(templateKeys).toContain("shire");
    expect(templateKeys).toContain("lunar");
    expect(templateKeys).toContain("hebrew");
  });

  it("should have valid gregorian calendar with 12 months", () => {
    const gregorian = CALENDAR_TEMPLATES.gregorian;

    expect(gregorian.name).toBe("Gregorian Calendar");
    expect(gregorian.months).toHaveLength(12);
    expect(gregorian.leapYearRule?.type).toBe("gregorian");
    expect(gregorian.useEras).toBe(true);
    expect(gregorian.eraNames?.before).toBe("BC");
    expect(gregorian.eraNames?.after).toBe("AD");
  });

  it("should have February with leap year days in gregorian calendar", () => {
    const gregorian = CALENDAR_TEMPLATES.gregorian;
    const february = gregorian.months[1];

    expect(february.name).toBe("February");
    expect(february.days).toBe(28);
    expect(february.leapYearDays).toBe(29);
  });

  it("should have 365 total days in gregorian calendar (non-leap year)", () => {
    const gregorian = CALENDAR_TEMPLATES.gregorian;
    const totalDays = gregorian.months.reduce(
      (sum, month) => sum + month.days,
      0,
    );

    expect(totalDays).toBe(365);
  });

  it("should have valid harptos calendar with special festival days", () => {
    const harptos = CALENDAR_TEMPLATES.harptos;

    expect(harptos.name).toBe("Calendar of Harptos");
    expect(harptos.months).toHaveLength(17);
  });

  it("should have eberron calendar with all 28-day months", () => {
    const eberron = CALENDAR_TEMPLATES.eberron;

    expect(eberron.name).toBe("Eberron Calendar");
    expect(eberron.months).toHaveLength(12);

    const allMonthsHave28Days = eberron.months.every(
      (month) => month.days === 28,
    );
    expect(allMonthsHave28Days).toBe(true);
  });

  it("should have exandrian calendar with 11 months", () => {
    const exandrian = CALENDAR_TEMPLATES.exandrian;

    expect(exandrian.name).toBe("Exandrian Calendar");
    expect(exandrian.months).toHaveLength(11);
  });

  it("should have imperial calendar with festival days", () => {
    const imperial = CALENDAR_TEMPLATES.imperial;

    expect(imperial.name).toBe("Imperial Calendar (Warhammer)");
    expect(imperial.months).toHaveLength(18);

    const hasOneDayMonths = imperial.months.some((month) => month.days === 1);
    expect(hasOneDayMonths).toBe(true);
  });

  it("should have lunar calendar with alternating 29 and 30 day months", () => {
    const lunar = CALENDAR_TEMPLATES.lunar;

    expect(lunar.name).toBe("Lunar Calendar (Islamic)");
    expect(lunar.months).toHaveLength(12);
    expect(lunar.useEras).toBe(true);
    expect(lunar.eraNames?.before).toBe("BH");
    expect(lunar.eraNames?.after).toBe("AH");
  });

  it("should have shire calendar with all 30-day months", () => {
    const shire = CALENDAR_TEMPLATES.shire;

    expect(shire.name).toBe("Shire Calendar");
    expect(shire.months).toHaveLength(12);

    const allMonthsHave30Days = shire.months.every(
      (month) => month.days === 30,
    );
    expect(allMonthsHave30Days).toBe(true);
  });

  it("should ensure all templates have a name and months array", () => {
    const templates = Object.values(CALENDAR_TEMPLATES);

    templates.forEach((template) => {
      expect(template.name).toBeTruthy();
      expect(Array.isArray(template.months)).toBe(true);
      expect(template.months.length).toBeGreaterThan(0);
    });
  });

  it("should ensure all month objects have name and days properties", () => {
    const templates = Object.values(CALENDAR_TEMPLATES);

    templates.forEach((template) => {
      template.months.forEach((month) => {
        expect(month.name).toBeTruthy();
        expect(typeof month.days).toBe("number");
        expect(month.days).toBeGreaterThan(0);
      });
    });
  });
});
