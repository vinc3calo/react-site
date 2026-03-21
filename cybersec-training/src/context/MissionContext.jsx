import { createContext, useContext, useState } from 'react';

const MissionContext = createContext();

export function MissionProvider({ children }) {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [progress, setProgress] = useState({
    phases: {}
  });
  const [user, setUser] = useState(null);
  const [missionStarted, setMissionStarted] = useState(false);

  

  const updatePhaseProgress = (phaseId, data) => {
    setProgress((prev) => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phaseId]: {
          ...prev.phases[phaseId],
          ...data
        }
      }
    }));
  };

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => prev + 1);
  };

  return (
    <MissionContext.Provider
      value={{
        currentLevel,
        setCurrentLevel,
        currentPhaseIndex,
        setCurrentPhaseIndex,   // ✅ ADD THIS
        nextPhase,
        progress,
        setProgress,
        missionStarted,
        user,
        setUser,
        updatePhaseProgress,
        setMissionStarted,
        currentPhase,         // ✅ ADD THIS
        setCurrentPhase       // ✅ ADD THIS
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export const useMission = () => useContext(MissionContext);