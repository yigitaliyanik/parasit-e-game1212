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
  analystFoundIds: string[];       // IDs the analyst has correctly submitted
  executiveAuthorized: string[];   // IDs the executive has authorized for repair
  engineerRepaired: string[];      // IDs the engineer has successfully repaired
  selectedDistrictIds: string[];   // 3 randomly chosen district IDs for this session
  wrongAttempts?: number;          // Track wrong analyst attempts for penalty
}

export interface Task2State {
  analystUnlockRequested: boolean;
  analystUnlocked: boolean;
  executiveManualChoice?: string;
  engineerCodeEntered: boolean;
  pipeAccessRequested: boolean;
  executiveGrantedPipeAccess: boolean;
  puzzleSolved: boolean;
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
  
  // Mission 2
  currentMission?: number; // 1 or 2
  mission2Ready?: Record<string, boolean>; // Ready check between missions
  task2?: Task2State;

  // Legacy fields
  selectedLocations?: string[];
  gearPuzzleSolved?: boolean;
  isAuthorized?: boolean;
  repairProgress?: number;
  penaltyTime?: number;             // Seconds to subtract from global timer
}

// ── All 8 Districts of Ecoville ──────────────────────────────────────
export interface DistrictData {
  id: string;
  district: string;
  clue: string;
  headline: string;
  // Map coordinates (SVG viewBox 0-100)
  mapX: number;
  mapY: number;
}

export const ALL_DISTRICTS: DistrictData[] = [
  {
    id: "8812",
    district: "Northgate",
    clue: "CITIZEN_REPORT:\n\"The industrial park warehouses in Northgate are making terrible noises. Sparks are flying from the transformer boxes and the whole area smells like ozone. People are evacuating.\"",
    headline: "Northgate Industrial Zone Reports Dangerous Transformer Failure",
    mapX: 35,
    mapY: 12,
  },
  {
    id: "4021",
    district: "Westbridge",
    clue: "CITIZEN_REPORT:\n\"There's a strange humming sound near the old bridge power station in Westbridge. The streetlights have been flickering for hours and my electronics keep shorting out. Something is very wrong down there.\"",
    headline: "Power Station Malfunction Rattles Westbridge Residents",
    mapX: 12,
    mapY: 50,
  },
  {
    id: "5590",
    district: "Southside",
    clue: "CITIZEN_REPORT:\n\"There's a burning smell coming from underground near the borders in Southside. The power keeps surging and dying. The whole district has gone dark except for a pulsing red glow.\"",
    headline: "Southside Plunges Into Darkness Amid Underground Electrical Fire",
    mapX: 62,
    mapY: 85,
  },
  {
    id: "2234",
    district: "Eastend",
    clue: "CITIZEN_REPORT:\n\"The residential towers in Eastend lost power at 03:00. There's a loud crackling from the substation on Harbor Road. Security cameras caught blue arcs jumping between the lines.\"",
    headline: "Eastend Harbor Substation Erupts In Electrical Storm",
    mapX: 88,
    mapY: 45,
  },
  {
    id: "7710",
    district: "Neon Gardens",
    clue: "CITIZEN_REPORT:\n\"All the decorative lights in Neon Gardens started overloading at once. The greenhouse complex lost climate control and the botanical mainframe is fried. Smoke is rising from Junction 7.\"",
    headline: "Neon Gardens Greenhouse Complex Loses Power — Botanical AI Offline",
    mapX: 18,
    mapY: 18,
  },
  {
    id: "3345",
    district: "Silicon Plaza",
    clue: "CITIZEN_REPORT:\n\"The central data hub at Silicon Plaza is experiencing cascading failures. Server rooms are overheating and the backup generators are making a grinding noise nobody recognizes.\"",
    headline: "Silicon Plaza Data Hub Suffers Cascading Infrastructure Collapse",
    mapX: 50,
    mapY: 48,
  },
  {
    id: "9012",
    district: "Ironworks District",
    clue: "CITIZEN_REPORT:\n\"The old foundry transformers in Ironworks are shooting flames. The metal fabrication wing has been evacuated. Fire crews say the electrical fire is spreading through underground conduits.\"",
    headline: "Ironworks Foundry Transformers Ignite — Underground Fire Spreads",
    mapX: 82,
    mapY: 82,
  },
  {
    id: "1108",
    district: "Old Town Sector",
    clue: "CITIZEN_REPORT:\n\"The heritage district is blacking out block by block. Old Town's ancient wiring can't handle the surges. The clock tower transformer exploded and shattered every window on the square.\"",
    headline: "Old Town Clock Tower Transformer Detonates — Historic District Dark",
    mapX: 22,
    mapY: 80,
  },
];

// ID lookup map for the Analyst
export const GRID_TRANSFORMER_IDS: Record<string, string> = Object.fromEntries(
  ALL_DISTRICTS.map(d => [d.district, d.id])
);

// Legacy compat — still used by some components
export const TRANSFORMER_DATA = ALL_DISTRICTS.slice(0, 3);

// Wire puzzle colors for engineer
export const WIRE_COLORS = ["#ff4444", "#44ff44", "#4488ff", "#ffaa00"] as const;
