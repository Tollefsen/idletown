import type { Choice, GameData } from "./types";

interface GameBoardProps {
  gameData: GameData;
  onChoice: (choice: Choice) => void;
  onReset: () => void;
}

export function GameBoard({ gameData, onChoice, onReset }: GameBoardProps) {
  const choices: Array<Exclude<Choice, null>> = ["rock", "paper", "scissors"];

  const getEmoji = (choice: Choice) => {
    switch (choice) {
      case "rock":
        return "🪨";
      case "paper":
        return "📄";
      case "scissors":
        return "✂️";
      default:
        return "❓";
    }
  };

  const getResultMessage = () => {
    if (gameData.roundWinner === "me") return "You Win! 🎉";
    if (gameData.roundWinner === "opponent") return "Opponent Wins! 😔";
    if (gameData.roundWinner === "tie") return "It's a Tie! 🤝";
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">You</div>
          <div className="text-3xl font-bold text-blue-600">
            {gameData.myScore}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400">VS</div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Opponent</div>
          <div className="text-3xl font-bold text-red-600">
            {gameData.opponentScore}
          </div>
        </div>
      </div>

      {gameData.gameState === "choosing" && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 text-center">
            {gameData.myChoice ? "Waiting for opponent..." : "Choose your move"}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {choices.map((choice) => (
              <button
                type="button"
                key={choice}
                onClick={() => onChoice(choice)}
                disabled={!!gameData.myChoice}
                className={`p-6 rounded-lg text-6xl transition-all ${
                  gameData.myChoice === choice
                    ? "bg-blue-600 transform scale-110"
                    : gameData.myChoice
                      ? "bg-gray-200 opacity-50 cursor-not-allowed"
                      : "bg-white hover:bg-blue-100 hover:transform hover:scale-110 shadow-lg"
                }`}
              >
                {getEmoji(choice)}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameData.gameState === "result" && (
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {getResultMessage()}
          </h3>
          <div className="flex justify-center items-center gap-8 text-6xl">
            <div className="flex flex-col items-center">
              <div>{getEmoji(gameData.myChoice)}</div>
              <div className="text-sm text-gray-600 mt-2">You</div>
            </div>
            <div className="text-4xl text-gray-400">vs</div>
            <div className="flex flex-col items-center">
              <div>{getEmoji(gameData.opponentChoice)}</div>
              <div className="text-sm text-gray-600 mt-2">Opponent</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            Play Again
          </button>
        </div>
      )}

      {gameData.gameState === "waiting" && (
        <div className="text-center text-gray-600 py-12">
          <p className="text-xl">Waiting for connection...</p>
        </div>
      )}
    </div>
  );
}
