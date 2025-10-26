import Image from "next/image";
import { useState } from "react";

type QRModalProps = {
  qrCodeUrl: string;
  shareUrl: string;
  onClose: () => void;
};

export function QRModal({ qrCodeUrl, shareUrl, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full relative z-10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
          Scan to View Drawing
        </h2>
        <Image
          src={qrCodeUrl}
          alt="QR Code"
          width={300}
          height={300}
          unoptimized
          className="w-full h-auto"
        />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
