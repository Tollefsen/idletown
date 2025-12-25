export type Choice = "rock" | "paper" | "scissors" | null;

export type GameState = "waiting" | "choosing" | "revealing" | "result";

export interface GameData {
  myChoice: Choice;
  opponentChoice: Choice;
  myScore: number;
  opponentScore: number;
  gameState: GameState;
  roundWinner: "me" | "opponent" | "tie" | null;
}
