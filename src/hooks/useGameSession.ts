import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, update, get, increment, onDisconnect } from 'firebase/database';
import { db, signInAnonymousUser } from '@/lib/firebase';
import { GameSession, Player, Role, GameStatus } from '@/lib/types';

export const useGameSession = (roomId: string) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      try {
        const user = await signInAnonymousUser();

        let storedName = localStorage.getItem('eco_player_name');
        if (!storedName) {
          storedName = `Agent-${Math.floor(Math.random() * 9000) + 1000}`;
          localStorage.setItem('eco_player_name', storedName);
        }

        setCurrentUser({ id: user.uid, name: storedName });

        const sessionRef = ref(db, `sessions/${roomId}`);

        unsubscribe = onValue(sessionRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as GameSession;
            setSession(data);
            
            // Host Migration logic
            if (data.players) {
              const hasHost = Object.values(data.players).some(p => p.isHost);
              if (!hasHost && data.players[user.uid]) {
                const sortedIds = Object.keys(data.players).sort();
                if (sortedIds[0] === user.uid) {
                  update(ref(db, `sessions/${roomId}/players/${user.uid}`), { isHost: true });
                }
              }
            }
          } else {
            setSession(null);
          }
          setLoading(false);
        }, (err) => {
          setError(`Failed to sync game state: ${err.message}`);
          setLoading(false);
        });
      } catch (err) {
        const error = err as Error;
        setError(`Failed to authenticate: ${error.message}`);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);

  const joinRoom = useCallback(async (isHost = false) => {
    if (!currentUser) throw new Error("User is not authenticated yet. Try again.");

    try {
      const sessionRef = ref(db, `sessions/${roomId}`);
      const snapshot = await get(sessionRef);

      const playerData: Player = {
        id: currentUser.id,
        name: currentUser.name,
        role: null,
        isReady: false,
        isHost: isHost,
      };

      if (!snapshot.exists() && isHost) {
        const newSession: GameSession = {
          roomId,
          gameStatus: 'waiting',
          players: { [currentUser.id]: playerData },
          generatorProgress: 0,
          isSystemOnline: false,
        };
        await set(sessionRef, newSession);
      } else if (snapshot.exists()) {
        const currentData = snapshot.val() as GameSession;
        const playerCount = currentData.players ? Object.keys(currentData.players).length : 0;

        if (playerCount >= 4 && (!currentData.players || !currentData.players[currentUser.id])) {
          throw new Error("Room is full");
        }

        await update(ref(db, `sessions/${roomId}/players`), {
          [currentUser.id]: playerData
        });
      } else {
        throw new Error("Operation code not found");
      }

      // Setup presence cleanup
      const playerRef = ref(db, `sessions/${roomId}/players/${currentUser.id}`);
      await onDisconnect(playerRef).remove();
    } catch (err) {
      throw err;
    }
  }, [currentUser, roomId]);

  const selectRole = async (role: Role) => {
    if (!currentUser || !session || session.rolesLocked) return;
    try {
      if (session.players[currentUser.id]?.role === role) {
        await update(ref(db, `sessions/${roomId}/players/${currentUser.id}`), { role: null });
        return;
      }

      const isRoleTaken = Object.values(session.players || {}).some(
        (p) => p.role === role && p.id !== currentUser.id
      );
      if (isRoleTaken) return;

      await update(ref(db, `sessions/${roomId}/players/${currentUser.id}`), { role });
    } catch (err) {
      console.error("[useGameSession] Error selecting role:", err);
    }
  };

  const toggleReady = async () => {
    if (!currentUser || !session || !session.players[currentUser.id]) return;
    try {
      const currentReadyState = session.players[currentUser.id].isReady;
      await update(ref(db, `sessions/${roomId}/players/${currentUser.id}`), {
        isReady: !currentReadyState
      });
    } catch (err) {
      console.error("[useGameSession] Error toggling ready state:", err);
    }
  };

  const updateGameStatus = async (status: GameStatus) => {
    if (!session) return;
    try {
      // Note: startTime is NOT set here — it is only set when isSystemOnline triggers
      await update(ref(db, `sessions/${roomId}`), { gameStatus: status });
    } catch (err) {
      console.error("[useGameSession] Error updating game status:", err);
    }
  };

  // Collaboratively increment the generator progress toward 100
  const incrementGenerator = async (amount: number = 3) => {
    if (!session || session.isSystemOnline) return;
    try {
      const sessionRef = ref(db, `sessions/${roomId}`);
      
      // Use atomic increment to prevent race conditions
      await update(sessionRef, {
        generatorProgress: increment(amount)
      });

      // Check if we hit the threshold
      const snapshot = await get(ref(db, `sessions/${roomId}/generatorProgress`));
      const current = snapshot.val() as number;

      if (current >= 100 && !session.isSystemOnline) {
        await update(sessionRef, {
          isSystemOnline: true,
          mission1Status: "briefing",
          startTime: Date.now(),
          generatorProgress: 100 // Cap it at 100
        });
      }
    } catch (err) {
      console.error("[useGameSession] Error incrementing generator:", err);
    }
  };

  const leaveLobby = async () => {
    if (!currentUser) return;
    try {
      const playerRef = ref(db, `sessions/${roomId}/players/${currentUser.id}`);
      await onDisconnect(playerRef).cancel();
      await set(playerRef, null);
    } catch (err) {
      console.error("[useGameSession] Error leaving lobby:", err);
    }
  };

  const lockRoles = async () => {
    if (!session) return;
    try {
      await update(ref(db, `sessions/${roomId}`), { rolesLocked: true });
    } catch (err) {
      console.error("[useGameSession] Error locking roles:", err);
    }
  };

  const randomizeRoles = async () => {
    if (!session || !session.players) return;
    try {
      const sessionRef = ref(db, `sessions/${roomId}`);
      const snapshot = await get(sessionRef);
      const currentData = snapshot.val() as GameSession;
      
      const count = currentData.randomizeCount || 0;
      if (count >= 2 || currentData.rolesLocked) return;

      const availableRoles: Role[] = ["engineer", "analyst", "executive", "journalist"];
      const currentPlayers = Object.values(currentData.players || {});
      
      for (let i = availableRoles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableRoles[i], availableRoles[j]] = [availableRoles[j], availableRoles[i]];
      }

      const updates: Record<string, string | number | boolean | null> = {};
      currentPlayers.forEach((player, index) => {
        updates[`players/${player.id}/role`] = availableRoles[index];
      });
      
      updates['randomizeCount'] = count + 1;
      if (count === 1) {
         updates['rolesLocked'] = true;
      }

      await update(sessionRef, updates);
    } catch (err) {
      console.error("[useGameSession] Error randomizing roles:", err);
    }
  };

  const currentPlayer = session?.players && currentUser ? session.players[currentUser.id] : null;

  return {
    session,
    loading,
    error,
    currentUser,
    currentPlayer,
    joinRoom,
    selectRole,
    toggleReady,
    updateGameStatus,
    randomizeRoles,
    lockRoles,
    leaveLobby,
    incrementGenerator,
    
    setMission1Ready: async (ready: boolean) => {
      if (!currentUser || !session) return;
      await update(ref(db, `sessions/${roomId}/mission1Ready`), {
        [currentUser.id]: ready
      });
    },

    updateMission1Status: async (status: GameSession['mission1Status']) => {
      if (!session) return;
      await update(ref(db, `sessions/${roomId}`), { mission1Status: status });
    },

    updateMission1Data: async (data: Partial<GameSession>) => {
      if (!session) return;
      await update(ref(db, `sessions/${roomId}`), data);
    },

    applyPenalty: async (seconds: number) => {
      if (!session) return;
      await update(ref(db, `sessions/${roomId}`), {
        penaltyTime: (session.penaltyTime || 0) + seconds
      });
    },
    setAuthStatus: async (status: 'pending' | 'completed') => {
      if (!currentUser || !session) return;
      await update(ref(db, `sessions/${roomId}`), {
        [`authStatus/${currentUser.id}`]: status
      });
    },

    setSystemOnline: async () => {
      if (!session) return;
      await update(ref(db, `sessions/${roomId}`), {
        isSystemOnline: true,
        mission1Status: "briefing",
        startTime: Date.now()
      });
    },

    setBriefingReady: async (role: string, ready: boolean) => {
      if (!session) return;
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      await update(ref(db, `sessions/${roomId}/briefingReady`), {
        [capitalizedRole]: ready
      });
    },
  };
};
