"use client";

import { useCallback, useState } from "react";
import { BackLink } from "../components/BackLink";
import { GameBoard } from "./GameBoard";
import type { Choice, GameData } from "./types";

function determineWinner(
  myChoice: Choice,
  opponentChoice: Choice,
): "me" | "opponent" | "tie" | null {
  if (!myChoice || !opponentChoice) return null;
  if (myChoice === opponentChoice) return "tie";

  const winConditions: Record<string, string> = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  return winConditions[myChoice] === opponentChoice ? "me" : "opponent";
}

function getComputerChoice(): Exclude<Choice, null> {
  const choices: Array<Exclude<Choice, null>> = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function RockPaperScissors() {
  const [gameData, setGameData] = useState<GameData>({
    myChoice: null,
    opponentChoice: null,
    myScore: 0,
    opponentScore: 0,
    gameState: "choosing",
    roundWinner: null,
  });

  const handleChoice = useCallback((choice: Choice) => {
    const computerChoice = getComputerChoice();
    const winner = determineWinner(choice, computerChoice);

    setGameData((prev) => ({
      myChoice: choice,
      opponentChoice: computerChoice,
      myScore: prev.myScore + (winner === "me" ? 1 : 0),
      opponentScore: prev.opponentScore + (winner === "opponent" ? 1 : 0),
      gameState: "result",
      roundWinner: winner,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setGameData((prev) => ({
      myChoice: null,
      opponentChoice: null,
      myScore: prev.myScore,
      opponentScore: prev.opponentScore,
      gameState: "choosing",
      roundWinner: null,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <BackLink />
              <h1 className="text-4xl font-bold text-gray-900">
                Rock Paper Scissors
              </h1>
            </div>
            <div className="bg-amber-100 text-amber-800 py-2 px-4 rounded-lg font-semibold text-sm">
              Multiplayer: Archived
            </div>
          </div>

          <GameBoard
            gameData={gameData}
            onChoice={handleChoice}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
