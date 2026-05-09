"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGameSession } from "@/hooks/useGameSession";
import LobbyPhase from "@/components/phases/LobbyPhase";
import BriefingPhase from "@/components/phases/BriefingPhase";
import CountdownAlert from "@/components/phases/CountdownAlert";
import PlayingPhase from "@/components/phases/PlayingPhase";
import GameOverScreen from "@/components/phases/GameOverScreen";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomId as string;
  const isHost = searchParams.get("host") === "true";

  const { session, loading, error, currentUser, joinRoom } = useGameSession(roomId);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (currentUser && !hasJoined && !error) {
      joinRoom(isHost)
        .then(() => setHasJoined(true))
        .catch((err: Error) => setInitError(err.message || "Failed to join room."));
    }
  }, [hasJoined, joinRoom, isHost, currentUser, error]);

  if (initError || error) {
    return (
      <div className="min-h-screen bg-[#030810] flex flex-col items-center justify-center text-red-500 font-mono p-4">
        <h1 className="text-2xl font-bold mb-2 uppercase tracking-widest">Connection Error</h1>
        <p className="text-red-400 text-sm mb-6">{initError || error}</p>
        <button
          onClick={() => router.push("/")}
          className="border border-red-500 px-6 py-2 hover:bg-red-500 hover:text-black transition-colors font-mono text-sm uppercase tracking-wider"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  if (loading || !session || (!hasJoined && isHost)) {
    return (
      <div className="min-h-screen bg-[#030810] flex flex-col items-center justify-center text-[#00ff9d] font-mono gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="uppercase tracking-[0.3em] text-sm animate-pulse">Establishing Secure Uplink...</p>
        <p className="text-[#4a6b8c] text-xs tracking-wider">
          {!currentUser ? "Authenticating..." : !hasJoined ? "Joining Operation..." : "Syncing State..."}
        </p>
      </div>
    );
  }

  switch (session.gameStatus) {
    case "waiting":
      return <LobbyPhase roomId={roomId} />;
    case "briefing":
      return <BriefingPhase roomId={roomId} />;
    case "countdown_alert":
      return <CountdownAlert roomId={roomId} />;
    case "playing":
      return <PlayingPhase roomId={roomId} />;
    case "game_over":
      return <GameOverScreen roomId={roomId} />;
    default:
      return <div className="text-white p-8">Unknown game state.</div>;
  }
}
