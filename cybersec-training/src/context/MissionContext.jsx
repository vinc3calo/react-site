import { createContext, useContext, useState } from "react";

const MissionContext = createContext();

export function MissionProvider({ children }) {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);

  // ✅ FIXED STRUCTURE (matches MissionEngine expectations)
  const [progress, setProgress] = useState({
    levels: {},
    meta: {}
  });

  const [user, setUser] = useState(null);

  // ✅ MUST start as false (prevents skipping briefing)
  const [missionStarted, setMissionStarted] = useState(false);

  // ===============================
  // 🧠 UPDATE PHASE PROGRESS (LEVEL-AWARE)
  // ===============================
  const updatePhaseProgress = (levelId, phaseId, data) => {
    setProgress((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [levelId]: {
          ...(prev.levels[levelId] || { phases: {} }),
          phases: {
            ...(prev.levels[levelId]?.phases || {}),
            [phaseId]: {
              ...(prev.levels[levelId]?.phases?.[phaseId] || {}),
              ...data
            }
          }
        }
      }
    }));
  };

  // ===============================
  // 🔄 PHASE NAVIGATION
  // ===============================
  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => prev + 1);
  };

  return (
    <MissionContext.Provider
      value={{
        currentLevel,
        setCurrentLevel,

        currentPhaseIndex,
        setCurrentPhaseIndex,
        nextPhase,

        progress,
        setProgress,

        missionStarted,
        setMissionStarted,

        user,
        setUser,

        updatePhaseProgress,

        currentPhase,
        setCurrentPhase
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export const useMission = () => useContext(MissionContext);