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

export interface Message {
  type: "choice" | "reveal" | "reset";
  choice?: Choice;
}

export interface ConnectionState {
  isConnected: boolean;
  isInitiator: boolean;
  peerId: string | null;
}

export interface PublicRoom {
  id: string;
  room_code: string;
  room_name: string;
  created_at: string;
  status: string;
}
