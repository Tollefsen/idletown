"use client";

import Link from "next/link";
import { useState } from "react";

const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

export default function CoinFlipper() {
  const [counter, setCounter] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const isHeads = Math.random() < 0.5;
      setResult(isHeads ? "heads" : "tails");

      if (isHeads) {
        setCounter((prev) => prev + 1);
      } else {
        setCounter(0);
      }

      setIsFlipping(false);
    }, 600);
  };

  const getCounterText = () => {
    if (counter < numberWords.length) {
      return numberWords[counter];
    }
    return counter.toString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-8">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-gray-700 hover:underline"
      >
        ← Back to Idle Town
      </Link>

      <div className="mb-8">
        <p className="text-2xl text-gray-700 font-bold capitalize">
          {getCounterText()}
        </p>
      </div>

      <button
        type="button"
        onClick={flipCoin}
        disabled={isFlipping}
        className={`w-40 h-40 rounded-full text-6xl font-bold shadow-lg transition-all ${
          isFlipping
            ? "animate-spin bg-yellow-400"
            : result === "heads"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : result === "tails"
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-yellow-500 hover:bg-yellow-600"
        } disabled:cursor-not-allowed`}
      >
        {isFlipping
          ? "🪙"
          : result === "heads"
            ? "👑"
            : result === "tails"
              ? "🦅"
              : "🪙"}
      </button>
    </div>
  );
}
