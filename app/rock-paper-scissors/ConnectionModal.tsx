import { useState } from "react";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  localOffer: string;
  isInitiator: boolean;
  onCreateOffer: () => void;
  onAcceptOffer: (offer: string) => void;
  onSetAnswer: (answer: string) => void;
  onStartOfflineMode: () => void;
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
}: ConnectionModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"none" | "host" | "join">("none");

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localOffer);
  };

  const handleHostGame = () => {
    setMode("host");
    onCreateOffer();
  };

  const handleJoinGame = () => {
    setMode("join");
  };

  const handleAcceptOffer = () => {
    onAcceptOffer(inputValue);
    setInputValue("");
  };

  const handleSetAnswer = () => {
    onSetAnswer(inputValue);
    setInputValue("");
    onClose();
  };

  const handleOfflineMode = () => {
    onStartOfflineMode();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Connect to Peer
        </h2>

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
              onClick={handleHostGame}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Host Game
            </button>
            <button
              type="button"
              onClick={handleJoinGame}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Join Game
            </button>
          </div>
        )}

        {mode === "host" && !localOffer && (
          <div className="text-gray-700">Generating connection code...</div>
        )}

        {mode === "host" && localOffer && !isInitiator && (
          <div className="text-gray-700">Setting up connection...</div>
        )}

        {mode === "host" && localOffer && isInitiator && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="offer-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Share this code with your peer:
              </label>
              <textarea
                id="offer-code"
                readOnly
                value={localOffer}
                className="w-full p-2 border rounded font-mono text-xs h-32 text-gray-900 bg-gray-50"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Copy Code
              </button>
            </div>

            <div>
              <label
                htmlFor="answer-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Paste their response code here:
              </label>
              <textarea
                id="answer-code"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border rounded font-mono text-xs h-32 text-gray-900"
                placeholder="Paste answer code here..."
              />
              <button
                type="button"
                onClick={handleSetAnswer}
                className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="host-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Paste host's code here:
              </label>
              <textarea
                id="host-code"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border rounded font-mono text-xs h-32 text-gray-900"
                placeholder="Paste offer code here..."
              />
              <button
                type="button"
                onClick={handleAcceptOffer}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Generate Response Code
              </button>
            </div>

            {localOffer && (
              <div>
                <label
                  htmlFor="response-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Share this response code with the host:
                </label>
                <textarea
                  id="response-code"
                  readOnly
                  value={localOffer}
                  className="w-full p-2 border rounded font-mono text-xs h-32 text-gray-900 bg-gray-50"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy Code
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Connection will complete automatically once the host enters
                  your code.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
