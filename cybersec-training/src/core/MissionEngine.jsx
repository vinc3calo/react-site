import { useEffect, useMemo } from "react";
import { useMission } from "../context/MissionContext";
import { socket } from "../core/socket";

import { level1 } from "../levels/level1";
import { level2 } from "../levels/level2";

import PhaseRenderer from "./PhaseRenderer";
import MissionBriefing from "../components/MissionBriefing";
import StartScreen from "../components/StartScreen";
import MissionComplete from "../components/MissionComplete";

import { getActivePhase } from "../utils/getActivePhase";
import { migrateProgress } from "../utils/migrateProgress";

export default function MissionEngine({ levelId, setLevelId }) {
  const {
    user,
    currentLevel,
    setCurrentLevel,
    missionStarted,
    setMissionStarted,
    progress,
    setProgress
  } = useMission();

  const levelMap = {
    operation_shadow_entry: level1,
    operation_shadow_escalation: level2
  };

  const selectedLevel = levelMap[levelId];

  // 🔄 Sync level
  useEffect(() => {
    if (selectedLevel && currentLevel?.id !== selectedLevel.id) {
      setCurrentLevel(selectedLevel);
    }
  }, [levelId, selectedLevel, currentLevel, setCurrentLevel]);

  // ===============================
  // 🧠 SAFE PROGRESS (ALWAYS RUN)
  // ===============================
  const safeProgress = migrateProgress(progress, selectedLevel?.id);

  const levelProgress = safeProgress?.levels?.[selectedLevel?.id] || {
    phases: {}
  };

  // ✅ ALWAYS call hooks (no conditional)
  const activePhaseId = useMemo(() => {
    if (!selectedLevel) return null;
    return getActivePhase(selectedLevel.phases, levelProgress);
  }, [selectedLevel, levelProgress]);

  const levelHasProgress =
    levelProgress?.phases &&
    Object.keys(levelProgress.phases).length > 0;

  const isLevelComplete =
    selectedLevel?.phases?.every(
      (p) => levelProgress.phases[p.id]?.completed === true
    ) || false;

  // ===============================
  // 🚫 EARLY RETURNS (AFTER HOOKS)
  // ===============================

  if (!user) return <StartScreen />;

  if (!selectedLevel) {
    return <div>Invalid level</div>;
  }

  // 🛑 WAIT FOR SYNC
  if (!currentLevel || currentLevel.id !== selectedLevel.id) {
    return <div>Loading mission...</div>;
  }

  // ===============================
  // 🎖️ BRIEFING
  // ===============================
  if (!missionStarted && !levelHasProgress) {
    return <MissionBriefing levelId={levelId} />;
  }

  // ===============================
  // 🏁 COMPLETION
  // ===============================
  if (isLevelComplete) {
    return (
      <MissionComplete
        level={selectedLevel}
        unlocked={true}
        onContinue={() => {
          const nextLevelId = "operation_shadow_escalation";

          const updatedProgress = {
            levels: safeProgress.levels || {},
            meta: {
              ...(safeProgress.meta || {}),
              currentLevel: nextLevelId
            }
          };

          setProgress(updatedProgress);
          setLevelId(nextLevelId);
          setMissionStarted(false);

          socket.emit("progress_update", {
            user: user.name,
            phase: "level_complete",
            progress: updatedProgress
          });
        }}
      />
    );
  }

  // ===============================
  // 🎯 PHASE
  // ===============================
  const phase = selectedLevel.phases.find(
    (p) => p.id === activePhaseId
  );

  if (!phase) {
    return <div>Phase not found</div>;
  }

  return (
    <div>
      <h2>{selectedLevel.title}</h2>
      <p style={{ fontSize: "0.8em" }}>
        Operator: {user.name}
      </p>

      <PhaseRenderer phase={phase} levelId={levelId} />
    </div>
  );
}