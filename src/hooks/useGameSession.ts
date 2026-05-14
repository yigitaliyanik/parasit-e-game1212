"use client";

import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, update, get, increment, onDisconnect } from 'firebase/database';
import { db, signInAnonymousUser } from '@/lib/firebase';
import { GameSession, Player, Role, GameStatus, ALL_DISTRICTS } from '@/lib/types';

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

  // ─── NEW: Countdown Alert & Timer ───────────────────────────────────

  const startCountdownAlert = async () => {
    if (!session) return;
    try {
      await update(ref(db, `sessions/${roomId}`), {
        gameStatus: "countdown_alert",
        startTime: Date.now(),
      });
    } catch (err) {
      console.error("[useGameSession] Error starting countdown alert:", err);
    }
  };

  const startPlaying = async () => {
    if (!session) return;
    try {
      // Randomly pick 3 of 8 districts for this session
      const shuffled = [...ALL_DISTRICTS].sort(() => Math.random() - 0.5);
      const selectedIds = shuffled.slice(0, 3).map(d => d.id);

      await update(ref(db, `sessions/${roomId}`), {
        gameStatus: "playing",
        currentMission: 1,
        task1: {
          analystFoundIds: [],
          executiveAuthorized: [],
          engineerRepaired: [],
          selectedDistrictIds: selectedIds,
          wrongAttempts: 0,
        },
      });
    } catch (err) {
      console.error("[useGameSession] Error starting playing phase:", err);
    }
  };

  // ─── NEW: Task 1 Methods ───────────────────────────────────────────

  const submitAnalystId = async (id: string): Promise<boolean> => {
    if (!session) return false;
    try {
      // Validate against the 3 randomly selected districts for this session
      const validIds = session.task1?.selectedDistrictIds || [];
      const alreadyFound = session.task1?.analystFoundIds || [];

      if (validIds.includes(id) && !alreadyFound.includes(id)) {
        // Correct ID
        await update(ref(db, `sessions/${roomId}/task1`), {
          analystFoundIds: [...alreadyFound, id],
        });
        return true;
      } else if (!validIds.includes(id)) {
        // Wrong ID — apply penalty
        const currentWrong = session.task1?.wrongAttempts || 0;
        await update(ref(db, `sessions/${roomId}`), {
          "task1/wrongAttempts": currentWrong + 1,
          penaltyTime: (session.penaltyTime || 0) + 30,
        });
        return false;
      }
      return false; // Already found
    } catch (err) {
      console.error("[useGameSession] Error submitting analyst ID:", err);
      return false;
    }
  };

  const authorizeRepair = async (transformerId: string) => {
    if (!session) return;
    try {
      const alreadyAuthorized = session.task1?.executiveAuthorized || [];
      if (alreadyAuthorized.includes(transformerId)) return;
      await update(ref(db, `sessions/${roomId}/task1`), {
        executiveAuthorized: [...alreadyAuthorized, transformerId],
      });
    } catch (err) {
      console.error("[useGameSession] Error authorizing repair:", err);
    }
  };

  const removeAuthorization = async (transformerId: string) => {
    if (!session) return;
    try {
      const alreadyAuthorized = session.task1?.executiveAuthorized || [];
      await update(ref(db, `sessions/${roomId}/task1`), {
        executiveAuthorized: alreadyAuthorized.filter(id => id !== transformerId),
      });
    } catch (err) {
      console.error("[useGameSession] Error removing authorization:", err);
    }
  };

  const completeRepair = async (transformerId: string) => {
    if (!session) return;
    try {
      const alreadyRepaired = session.task1?.engineerRepaired || [];
      if (alreadyRepaired.includes(transformerId)) return;
      await update(ref(db, `sessions/${roomId}/task1`), {
        engineerRepaired: [...alreadyRepaired, transformerId],
      });
    } catch (err) {
      console.error("[useGameSession] Error completing repair:", err);
    }
  };

  const setGameOver = async () => {
    if (!session) return;
    try {
      await update(ref(db, `sessions/${roomId}`), { gameStatus: "game_over" });
    } catch (err) {
      console.error("[useGameSession] Error setting game over:", err);
    }
  };

  // ─── NEW: Task 2 Methods ───────────────────────────────────────────

  const setMission2Ready = async (ready: boolean) => {
    if (!currentUser || !session) return;
    await update(ref(db, `sessions/${roomId}/mission2Ready`), {
      [currentUser.id]: ready
    });
  };

  const startMission2 = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}`), {
      currentMission: 2,
      task2: {
        analystUnlockRequested: false,
        analystUnlocked: false,
        engineerCodeEntered: false,
        pipeAccessRequested: false,
        executiveGrantedPipeAccess: false,
        puzzleSolved: false,
      }
    });
  };

  const requestAnalystUnlock = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { analystUnlockRequested: true });
  };

  const completeAnalystUnlock = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { analystUnlocked: true });
  };

  const submitExecutiveManualChoice = async (choice: string) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { executiveManualChoice: choice });
  };

  const submitEngineerCodeTask2 = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { engineerCodeEntered: true });
  };

  const requestPipeAccess = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { pipeAccessRequested: true });
  };

  const grantPipeAccess = async (granted: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { executiveGrantedPipeAccess: granted });
  };

  const completeTask2Puzzle = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task2`), { puzzleSolved: true });
  };

  // ─── NEW: Task 3 Methods ───────────────────────────────────────────

  const setMission3Ready = async (ready: boolean) => {
    if (!currentUser || !session) return;
    await update(ref(db, `sessions/${roomId}/mission3Ready`), {
      [currentUser.id]: ready
    });
  };

  const startMission3 = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}`), {
      currentMission: 3,
      task3: {
        executiveAccessGranted: false,
        engineerLogged: false,
        powerRestored: false,
        completed: false,
      }
    });
  };

  const setTask3ExecutiveAccess = async (granted: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task3`), { executiveAccessGranted: granted });
  };

  const setTask3EngineerLogged = async (logged: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task3`), { engineerLogged: logged });
  };

  const setTask3PowerRestored = async (restored: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task3`), { powerRestored: restored });
  };

  const setTask3Completed = async (completed: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task3`), { completed: completed });
  };

  // ─── NEW: Task 4 Methods ───────────────────────────────────────────

  const setMission4Ready = async (ready: boolean) => {
    if (!currentUser || !session) return;
    await update(ref(db, `sessions/${roomId}/mission4Ready`), {
      [currentUser.id]: ready
    });
  };

  const startMission4 = async () => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}`), {
      currentMission: 4,
      task4: {
        routeChanged: false,
        wagonsDetached: false,
        completed: false,
      }
    });
  };

  const setTask4RouteChanged = async (changed: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task4`), { routeChanged: changed });
  };

  const setTask4WagonsDetached = async (detached: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task4`), { wagonsDetached: detached });
  };

  const setTask4Completed = async (completed: boolean) => {
    if (!session) return;
    await update(ref(db, `sessions/${roomId}/task4`), { completed: completed });
  };

  // ─── Derived State ─────────────────────────────────────────────────

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
    
    // Briefing
    setBriefingReady: async (role: string, ready: boolean) => {
      if (!session) return;
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      await update(ref(db, `sessions/${roomId}/briefingReady`), {
        [capitalizedRole]: ready
      });
    },

    // Countdown & Timer
    startCountdownAlert,
    startPlaying,
    setGameOver,

    // Task 1
    submitAnalystId,
    authorizeRepair,
    removeAuthorization,
    completeRepair,

    // Task 2
    setMission2Ready,
    startMission2,
    requestAnalystUnlock,
    completeAnalystUnlock,
    submitExecutiveManualChoice,
    submitEngineerCodeTask2,
    requestPipeAccess,
    grantPipeAccess,
    completeTask2Puzzle,

    // Task 3
    setMission3Ready,
    startMission3,
    setTask3ExecutiveAccess,
    setTask3EngineerLogged,
    setTask3PowerRestored,
    setTask3Completed,

    // Task 4
    setMission4Ready,
    startMission4,
    setTask4RouteChanged,
    setTask4WagonsDetached,
    setTask4Completed,

    // Legacy helpers
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
  };
};
