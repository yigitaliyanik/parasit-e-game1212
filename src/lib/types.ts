export type GameStatus = "waiting" | "playing";
export type Role = "engineer" | "analyst" | "executive" | "journalist";

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  isReady: boolean;
  isHost: boolean;
}

export interface GameSession {
  roomId: string;
  gameStatus: GameStatus;
  players: Record<string, Player>; // Map of playerId to Player object
  generatorProgress: number;       // 0–100, collaborative Ice Breaker
  isSystemOnline: boolean;         // Triggers Mission 1 Briefing
  startTime?: number;              // Set only when Mission 1 is complete
  // Mission 1 Coordination
  randomizeCount?: number;          // 0-2 limit for host
  rolesLocked?: boolean;            // true if roles are locked
  authStatus?: Record<string, "pending" | "completed">; // Access Sync
  mission1Ready?: Record<string, boolean>; // Map of playerId to ready status
  mission1Status?: "briefing" | "in_progress" | "gear_puzzle" | "authorizing" | "repairing" | "complete";
  
  // Mission 1 Logic
  selectedLocations?: string[];     // Used by Engineer
  gearPuzzleSolved?: boolean;       // Used by Engineer
  isAuthorized?: boolean;           // Used by Executive
  repairProgress?: number;          // 0-100, for the 10s bar
  penaltyTime?: number;             // Seconds to subtract from global timer
}

