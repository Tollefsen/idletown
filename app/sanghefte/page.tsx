"use client";

import Image from "next/image";
import { redirect, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Suspense, useEffect, useState } from "react";
import { BackLink } from "../components/BackLink";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { LIMITS } from "../config/constants";
import type { Songbook } from "./types";
import { decodeSongs, encodeSongs } from "./utils";

function SanghefteContent() {
  const searchParams = useSearchParams();
  const [songs, setSongs] = useState<Songbook>([]);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      redirect("/");
    }
    const decoded = decodeSongs(data);
    if (decoded.length === 0) {
      redirect("/");
    }
    setSongs(decoded);
  }, [searchParams]);

  const handleShare = async () => {
    const encoded = encodeSongs(songs);
    const url = `${window.location.origin}/sanghefte?data=${encoded}`;

    if (url.length > LIMITS.qrCapacity) {
      setError(
        `Sangheftet er for stort for QR-kode (${url.length} tegn, maks ${LIMITS.qrCapacity}). Bruk lenken i stedet.`,
      );
      setShareUrl(url);
      setShowQR(true);
      return;
    }

    setError(null);
    setShareUrl(url);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch {
      setError("Kunne ikke generere QR-kode.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kunne ikke kopiere lenken.");
    }
  };

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Laster...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 sm:p-8">
      <BackLink />

      <div className="max-w-2xl mx-auto mt-12 sm:mt-8">
        {/* Pamphlet header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-900">
            Sanghefte 2.0
          </h1>
          <p className="text-amber-700 mt-2 font-serif italic">
            {songs.length} {songs.length === 1 ? "sang" : "sanger"}
          </p>
        </div>

        {/* Pamphlet content */}
        <div className="bg-stone-100 rounded-lg shadow-lg p-6 sm:p-10 border border-amber-200">
          {songs.map((song, index) => (
            <article key={song.title} className="mb-8 last:mb-0">
              {/* Song number and title */}
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-900 mb-3">
                <span className="text-amber-600">{index + 1}.</span>{" "}
                {song.title}
              </h2>

              {/* Divider */}
              <div className="w-24 h-px bg-amber-300 mb-4" />

              {/* Lyrics */}
              <pre className="font-serif text-amber-950 whitespace-pre-wrap leading-relaxed text-base sm:text-lg">
                {song.lyrics}
              </pre>

              {/* Song separator */}
              {index < songs.length - 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="w-8 h-px bg-amber-300" />
                    <span className="text-sm">~</span>
                    <span className="w-8 h-px bg-amber-300" />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Share button */}
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={handleShare}>
            Del Sanghefte
          </Button>
        </div>
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="Del Sanghefte"
      >
        {error && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-800 rounded text-sm">
            {error}
          </div>
        )}

        {qrCodeUrl && !error && (
          <div className="flex justify-center mb-4">
            <Image
              src={qrCodeUrl}
              alt="QR-kode"
              width={250}
              height={250}
              unoptimized
            />
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 break-all">{shareUrl}</p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={copyToClipboard}
            className="flex-1"
          >
            {copied ? "Kopiert!" : "Kopier Lenke"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowQR(false)}
            className="flex-1"
          >
            Lukk
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function Sanghefte() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-amber-50">
          Laster...
        </div>
      }
    >
      <SanghefteContent />
    </Suspense>
  );
}
