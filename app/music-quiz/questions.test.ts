import { describe, expect, it } from "vitest";
import { questions } from "./questions";

describe("questions", () => {
  it("should be an array", () => {
    expect(Array.isArray(questions)).toBe(true);
  });

  it("should contain at least one question", () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it("should have valid structure for each question", () => {
    questions.forEach((question) => {
      expect(question).toHaveProperty("youtubeId");
      expect(question).toHaveProperty("correctAnswers");
      expect(typeof question.youtubeId).toBe("string");
    });
  });

  it("should have correct answer structure", () => {
    questions.forEach((question) => {
      expect(question.correctAnswers).toHaveProperty("songName");
      expect(question.correctAnswers).toHaveProperty("originalArtist");
      expect(question.correctAnswers).toHaveProperty("coverStyle");
      expect(typeof question.correctAnswers.songName).toBe("string");
      expect(typeof question.correctAnswers.originalArtist).toBe("string");
      expect(typeof question.correctAnswers.coverStyle).toBe("string");
    });
  });

  it("should have non-empty youtube IDs", () => {
    questions.forEach((question) => {
      expect(question.youtubeId.length).toBeGreaterThan(0);
    });
  });

  it("should have non-empty correct answers", () => {
    questions.forEach((question) => {
      expect(question.correctAnswers.songName.length).toBeGreaterThan(0);
      expect(question.correctAnswers.originalArtist.length).toBeGreaterThan(0);
      expect(question.correctAnswers.coverStyle.length).toBeGreaterThan(0);
    });
  });

  it("should contain the rick roll question", () => {
    const rickRoll = questions.find((q) => q.youtubeId === "dQw4w9WgXcQ");

    expect(rickRoll).toBeDefined();
    expect(rickRoll?.correctAnswers.songName).toBe("Never Gonna Give You Up");
    expect(rickRoll?.correctAnswers.originalArtist).toBe("Rick Astley");
    expect(rickRoll?.correctAnswers.coverStyle).toBe("Original");
  });
});
