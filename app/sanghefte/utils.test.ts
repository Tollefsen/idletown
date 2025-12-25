import { describe, expect, it } from "vitest";
import type { Songbook } from "./types";
import { decodeSongs, encodeSongs, generateShareUrl } from "./utils";

describe("encodeSongs and decodeSongs", () => {
  it("should roundtrip encode and decode a songbook", () => {
    const songs: Songbook = [
      { title: "Test Song", lyrics: "La la la\nTra la la" },
      { title: "Another Song", lyrics: "Do re mi\nFa so la" },
    ];

    const encoded = encodeSongs(songs);
    const decoded = decodeSongs(encoded);

    expect(decoded).toEqual(songs);
  });

  it("should handle Norwegian characters (æøå)", () => {
    const songs: Songbook = [
      {
        title: "Bæ, Bæ, Lille Lam",
        lyrics: "Bæ, bæ, lille lam\nHar du noe ull?\nJa, ja, kjære barn",
      },
    ];

    const encoded = encodeSongs(songs);
    const decoded = decodeSongs(encoded);

    expect(decoded).toEqual(songs);
  });

  it("should handle empty songbook", () => {
    const songs: Songbook = [];

    const encoded = encodeSongs(songs);
    const decoded = decodeSongs(encoded);

    expect(decoded).toEqual(songs);
  });

  it("should return empty array for invalid encoded string", () => {
    const decoded = decodeSongs("invalid-data-here!!!");

    expect(decoded).toEqual([]);
  });

  it("should produce URL-safe encoded string", () => {
    const songs: Songbook = [
      { title: "Test", lyrics: "Some lyrics with special chars: +/=" },
    ];

    const encoded = encodeSongs(songs);

    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("should compress multiple songs efficiently", () => {
    const songs: Songbook = [
      { title: "Song 1", lyrics: "Verse 1\nChorus\nVerse 2\nChorus" },
      { title: "Song 2", lyrics: "Intro\nVerse\nChorus\nVerse\nChorus" },
      { title: "Song 3", lyrics: "La la la\nLa la la\nLa la la" },
    ];

    const encoded = encodeSongs(songs);
    const jsonLength = JSON.stringify(songs).length;

    // Compressed + base64 should be smaller than raw JSON for repetitive content
    expect(encoded.length).toBeLessThan(jsonLength);
  });
});

describe("generateShareUrl", () => {
  it("should generate a valid share URL", () => {
    const songs: Songbook = [{ title: "Test", lyrics: "La la la" }];
    const baseUrl = "https://example.com/sanghefte";

    const url = generateShareUrl(songs, baseUrl);

    expect(url).toContain(baseUrl);
    expect(url).toContain("?data=");
  });
});
