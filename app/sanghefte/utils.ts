import pako from "pako";
import type { Songbook } from "./types";

export function encodeSongs(songs: Songbook): string {
  const json = JSON.stringify(songs);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64;
}

export function decodeSongs(encoded: string): Songbook {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;

    const compressed = Uint8Array.from(atob(paddedBase64), (c) =>
      c.charCodeAt(0),
    );
    const json = pako.inflate(compressed, { to: "string" });
    return JSON.parse(json) as Songbook;
  } catch {
    return [];
  }
}

export function generateShareUrl(songs: Songbook, baseUrl: string): string {
  const encoded = encodeSongs(songs);
  return `${baseUrl}?data=${encoded}`;
}
