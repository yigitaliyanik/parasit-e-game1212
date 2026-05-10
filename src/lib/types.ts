export type GameStatus = "waiting" | "briefing" | "countdown_alert" | "playing" | "game_over";
export type Role = "engineer" | "analyst" | "executive" | "journalist";

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  isReady: boolean;
  isHost: boolean;
}

export interface Task1State {
  // District → Transformer ID mapping is hardcoded in puzzle data
  analystFoundIds: string[];       // IDs the analyst has correctly submitted
  executiveAuthorized: string[];   // IDs the executive has authorized for repair
  engineerRepaired: string[];      // IDs the engineer has successfully repaired
  wrongAttempts?: number;          // Track wrong analyst attempts for penalty
}

export interface GameSession {
  roomId: string;
  gameStatus: GameStatus;
  players: Record<string, Player>; // Map of playerId to Player object
  generatorProgress: number;       // 0–100, collaborative Ice Breaker
  isSystemOnline: boolean;         // Triggers Mission 1 Briefing
  startTime?: number;              // Set when countdown_alert begins (for 30min timer)
  // Lobby
  randomizeCount?: number;          // 0-2 limit for host
  rolesLocked?: boolean;            // true if roles are locked
  // Briefing
  briefingReady?: Record<string, boolean>; // Map of role to ready status
  // Auth
  authStatus?: Record<string, "pending" | "completed">; // Access Sync
  // Mission 1
  mission1Ready?: Record<string, boolean>; // Map of playerId to ready status
  mission1Status?: "briefing" | "in_progress" | "gear_puzzle" | "authorizing" | "repairing" | "complete";
  task1?: Task1State;
  // Legacy fields
  selectedLocations?: string[];
  gearPuzzleSolved?: boolean;
  isAuthorized?: boolean;
  repairProgress?: number;
  penaltyTime?: number;             // Seconds to subtract from global timer
}

// Puzzle data — hardcoded transformer locations
export const TRANSFORMER_DATA = [
  {
    id: "4021",
    district: "Westbridge",
    clue: "CITIZEN_REPORT #1:\n\"There's a strange humming sound near the old bridge power station in Westbridge. The streetlights have been flickering for hours and my electronics keep shorting out. Something is very wrong down there.\"",
    gridPosition: { row: 1, col: 0 },
  },
  {
    id: "8812",
    district: "Northgate",
    clue: "CITIZEN_REPORT #2:\n\"The industrial park warehouses in Northgate are making terrible noises. Sparks are flying from the transformer boxes and the whole area smells like ozone. People are evacuating.\"",
    gridPosition: { row: 0, col: 0 },
  },
  {
    id: "9934",
    district: "Southside",
    clue: "CITIZEN_REPORT #3:\n\"There's a burning smell coming from underground near the borders in Southside. The power keeps surging and dying. The whole district has gone dark except for a pulsing red glow.\"",
    gridPosition: { row: 1, col: 1 },
  },
] as const;

// Grid map data for the Analyst
export const CITY_GRID = [
  ["Northgate", "Eastend"],
  ["Westbridge", "Southside"],
] as const;

export const GRID_TRANSFORMER_IDS: Record<string, string> = {
  "Northgate": "8812",
  "Westbridge": "4021",
  "Southside": "9934",
  "Eastend": "1156",
};

// Wire puzzle colors for engineer
export const WIRE_COLORS = ["#ff4444", "#44ff44", "#4488ff", "#ffaa00"] as const;
