"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BackLink } from "../components/BackLink";
import { Button } from "../components/Button";
import { ConnectionModal } from "./ConnectionModal";
import { GameBoard } from "./GameBoard";
import type { Choice, GameData, Message } from "./types";
import { useWebRTC } from "./useWebRTC";
import { WaitingRoom } from "./WaitingRoom";

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
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gameData, setGameData] = useState<GameData>({
    myChoice: null,
    opponentChoice: null,
    myScore: 0,
    opponentScore: 0,
    gameState: "waiting",
    roundWinner: null,
  });

  // Track pending room code for public room joins
  const pendingPublicRoomCode = useRef<string | null>(null);

  const handleMessage = useCallback((message: Message) => {
    if (message.type === "choice") {
      setGameData((prev) => {
        const newData: GameData = {
          ...prev,
          opponentChoice: message.choice ?? null,
        };

        if (prev.myChoice && message.choice) {
          const winner = determineWinner(prev.myChoice, message.choice);
          newData.gameState = "result";
          newData.roundWinner = winner;

          if (winner === "me") {
            newData.myScore = prev.myScore + 1;
          } else if (winner === "opponent") {
            newData.opponentScore = prev.opponentScore + 1;
          }
        }

        return newData;
      });
    } else if (message.type === "reset") {
      setGameData((prev) => ({
        myChoice: null,
        opponentChoice: null,
        myScore: prev.myScore,
        opponentScore: prev.opponentScore,
        gameState: "choosing",
        roundWinner: null,
      }));
    }
  }, []);

  const {
    isConnected,
    isInitiator,
    localOffer,
    createOffer,
    acceptOffer,
    setRemoteAnswer,
    setRoomCode,
    sendMessage,
  } = useWebRTC(handleMessage);

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (isOfflineMode) {
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
      } else {
        setGameData((prev) => {
          const newData = { ...prev, myChoice: choice };

          if (prev.opponentChoice) {
            const winner = determineWinner(choice, prev.opponentChoice);
            newData.gameState = "result";
            newData.roundWinner = winner;

            if (winner === "me") {
              newData.myScore = prev.myScore + 1;
            } else if (winner === "opponent") {
              newData.opponentScore = prev.opponentScore + 1;
            }
          }

          return newData;
        });

        sendMessage({ type: "choice", choice });
      }
    },
    [isOfflineMode, sendMessage],
  );

  const handleReset = useCallback(() => {
    setGameData((prev) => ({
      myChoice: null,
      opponentChoice: null,
      myScore: prev.myScore,
      opponentScore: prev.opponentScore,
      gameState: "choosing",
      roundWinner: null,
    }));
    if (!isOfflineMode) {
      sendMessage({ type: "reset" });
    }
  }, [isOfflineMode, sendMessage]);

  // Transition to choosing state when connected
  useEffect(() => {
    console.log("Connection effect:", {
      isConnected,
      gameState: gameData.gameState,
    });
    if (isConnected && gameData.gameState === "waiting") {
      console.log("Transitioning to choosing state");
      setGameData((prev) => ({ ...prev, gameState: "choosing" }));
    }
  }, [isConnected, gameData.gameState]);

  const handleStartOfflineMode = useCallback(() => {
    setIsOfflineMode(true);
    setGameData({
      myChoice: null,
      opponentChoice: null,
      myScore: 0,
      opponentScore: 0,
      gameState: "choosing",
      roundWinner: null,
    });
  }, []);

  const handleJoinPublicRoom = useCallback(
    async (roomCode: string) => {
      setShowWaitingRoom(false);

      try {
        // Fetch the host's offer from the room
        const response = await fetch(
          `/api/webrtc/get-offer?roomCode=${roomCode}`,
        );

        if (!response.ok) {
          console.error("Failed to get room offer");
          return;
        }

        const data = await response.json();

        // Store the room code in ref so we can send answer later
        pendingPublicRoomCode.current = roomCode;

        // Accept the offer - this will generate our answer
        acceptOffer(data.offer);
      } catch (err) {
        console.error("Error joining room:", err);
      }
    },
    [acceptOffer],
  );

  // Effect to send answer to Supabase when joining a public room
  useEffect(() => {
    if (pendingPublicRoomCode.current && localOffer && !isInitiator) {
      const sendAnswer = async () => {
        const roomCode = pendingPublicRoomCode.current;
        pendingPublicRoomCode.current = null;

        try {
          await fetch("/api/webrtc/join-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomCode,
              answer: localOffer,
            }),
          });
        } catch (err) {
          console.error("Failed to send answer:", err);
        }
      };

      sendAnswer();
    }
  }, [localOffer, isInitiator]);

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
            {!isConnected && !isOfflineMode && (
              <Button
                variant="primary"
                onClick={() => setShowConnectionModal(true)}
              >
                Connect
              </Button>
            )}
            {isConnected && (
              <div className="bg-green-100 text-green-800 py-2 px-4 rounded-lg font-semibold">
                Connected ✓
              </div>
            )}
            {isOfflineMode && (
              <div className="bg-purple-100 text-purple-800 py-2 px-4 rounded-lg font-semibold">
                Offline Mode
              </div>
            )}
          </div>

          <GameBoard
            gameData={gameData}
            onChoice={handleChoice}
            onReset={handleReset}
          />
        </div>
      </div>

      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        localOffer={localOffer}
        isInitiator={isInitiator}
        onCreateOffer={createOffer}
        onAcceptOffer={acceptOffer}
        onSetAnswer={setRemoteAnswer}
        onStartOfflineMode={handleStartOfflineMode}
        onOpenWaitingRoom={() => setShowWaitingRoom(true)}
        onSetRoomCode={setRoomCode}
      />

      <WaitingRoom
        isOpen={showWaitingRoom}
        onClose={() => setShowWaitingRoom(false)}
        onJoinRoom={handleJoinPublicRoom}
      />
    </div>
  );
}
