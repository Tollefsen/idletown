import { useEffect, useState } from "react";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  localOffer: string;
  isInitiator: boolean;
  onCreateOffer: () => void;
  onAcceptOffer: (offer: string) => void;
  onSetAnswer: (answer: string) => void;
  onStartOfflineMode: () => void;
  onOpenWaitingRoom: () => void;
  onSetRoomCode: (roomCode: string) => void;
}

export function ConnectionModal({
  isOpen,
  onClose,
  localOffer,
  isInitiator,
  onCreateOffer,
  onAcceptOffer,
  onSetAnswer,
  onStartOfflineMode,
  onOpenWaitingRoom,
  onSetRoomCode,
}: ConnectionModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"none" | "host" | "join">("none");
  const [roomCode, setRoomCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [pendingJoinRoomCode, setPendingJoinRoomCode] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [roomName, setRoomName] = useState("");

  // Create room on Supabase when hosting
  useEffect(() => {
    if (mode === "host" && localOffer && isInitiator && !roomCode) {
      const createRoom = async () => {
        setIsLoading(true);
        setError("");

        try {
          const response = await fetch("/api/webrtc/create-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              offer: localOffer,
              isPublic,
              roomName: roomName || "Game Room",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create room");
          }

          const data = await response.json();
          setRoomCode(data.roomCode);
          onSetRoomCode(data.roomCode);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to create room. Please try again.",
          );
        } finally {
          setIsLoading(false);
        }
      };

      createRoom();
    }
  }, [
    mode,
    localOffer,
    isInitiator,
    roomCode,
    isPublic,
    roomName,
    onSetRoomCode,
  ]);

  // Poll for peer answer when hosting
  useEffect(() => {
    if (mode !== "host" || !roomCode || !isInitiator) return;

    const pollForAnswer = async () => {
      try {
        const response = await fetch(
          `/api/webrtc/get-answer?roomCode=${roomCode}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.answer) {
            onSetAnswer(data.answer);
            onClose();
          }
        }
      } catch (err) {
        console.error("Error polling for answer:", err);
      }
    };

    const interval = setInterval(pollForAnswer, 2000);
    return () => clearInterval(interval);
  }, [mode, roomCode, isInitiator, onSetAnswer, onClose]);

  // Send answer to Supabase when joining and localOffer is ready
  useEffect(() => {
    if (mode === "join" && localOffer && pendingJoinRoomCode && !isInitiator) {
      const sendAnswer = async () => {
        try {
          await fetch("/api/webrtc/join-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomCode: pendingJoinRoomCode,
              answer: localOffer,
            }),
          });

          setPendingJoinRoomCode("");
          setIsLoading(false);
          onClose();
        } catch (_err) {
          setError("Failed to send answer. Connection may still work.");
          setIsLoading(false);
        }
      };

      sendAnswer();
    }
  }, [mode, localOffer, pendingJoinRoomCode, isInitiator, onClose]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
      setRoomCode("");
      setError("");
      setIsLoading(false);
      setPendingJoinRoomCode("");
      setIsPublic(false);
      setRoomName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  const handleHostGame = () => {
    setMode("host");
    setError("");
  };

  const handleStartHosting = () => {
    if (isPublic && !roomName.trim()) {
      setError("Please enter a room name for public rooms");
      return;
    }
    onCreateOffer();
  };

  const handleJoinGame = () => {
    setMode("join");
    setError("");
  };

  const handleJoinRoom = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Fetch the host's offer from the room
      const response = await fetch(
        `/api/webrtc/get-offer?roomCode=${inputValue.toUpperCase()}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Room not found");
      }

      const data = await response.json();

      // Accept the offer which will trigger localOffer generation
      onAcceptOffer(data.offer);

      // Store the room code to send answer once localOffer is ready
      setPendingJoinRoomCode(inputValue.toUpperCase());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to join room. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOfflineMode = () => {
    onStartOfflineMode();
    onClose();
  };

  const handleBrowsePublicRooms = () => {
    onClose();
    onOpenWaitingRoom();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Connect to Peer
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
            {error}
          </div>
        )}

        {mode === "none" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleOfflineMode}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Play vs Computer
            </button>
            <button
              type="button"
              onClick={handleBrowsePublicRooms}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Public Rooms
            </button>
            <button
              type="button"
              onClick={handleHostGame}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              Host Game
            </button>
            <button
              type="button"
              onClick={handleJoinGame}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Join with Room Code
            </button>
          </div>
        )}

        {mode === "host" && !roomCode && !localOffer && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="room-name-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Room Name (optional):
              </label>
              <input
                id="room-name-input"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-3 border-2 rounded-lg text-gray-900"
                placeholder="My Game Room"
                maxLength={50}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="public-checkbox"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label
                htmlFor="public-checkbox"
                className="text-sm text-gray-700"
              >
                Make this a public room (visible in waiting room)
              </label>
            </div>
            <button
              type="button"
              onClick={handleStartHosting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Room
            </button>
          </div>
        )}

        {mode === "host" && !roomCode && localOffer && (
          <div className="text-gray-700 text-center py-4">
            {isLoading ? "Creating room..." : "Generating connection..."}
          </div>
        )}

        {mode === "host" && roomCode && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Share this room code with your friend:
              </div>
              <div className="bg-white border-2 border-blue-400 rounded-lg p-4 mb-3">
                <div className="text-4xl font-bold text-blue-600 tracking-wider font-mono">
                  {roomCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy Room Code
              </button>
            </div>

            <div className="text-center text-gray-600">
              <p className="text-sm">Waiting for peer to join...</p>
              <div className="mt-2 flex justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="room-code-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter the host's room code:
              </label>
              <input
                id="room-code-input"
                type="text"
                value={inputValue}
                onChange={(e) =>
                  setInputValue(e.target.value.toUpperCase().trim())
                }
                className="w-full p-3 border-2 rounded-lg font-mono text-2xl text-center text-gray-900 uppercase tracking-wider"
                placeholder="ABC123"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleJoinRoom}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? "Joining..." : "Join Game"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setMode("none");
            setRoomCode("");
            setError("");
            setInputValue("");
          }}
          className="mt-6 w-full bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
        >
          {mode === "none" ? "Close" : "Back"}
        </button>
      </div>
    </div>
  );
}
