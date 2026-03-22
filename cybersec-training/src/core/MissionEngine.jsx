import { useEffect } from "react";
import { useMission } from "../context/MissionContext";

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
    progress,
    setProgress
  } = useMission();

  const levelMap = {
    operation_shadow_entry: level1,
    operation_shadow_escalation: level2
  };

  const selectedLevel = levelMap[levelId];

  useEffect(() => {
    if (selectedLevel && currentLevel?.id !== selectedLevel.id) {
      setCurrentLevel(selectedLevel);
    }
  }, [levelId, selectedLevel, currentLevel, setCurrentLevel]);

  if (!user) {
    return <StartScreen />;
  }

  if (!selectedLevel) {
    return (
      <div>
        <h2>Level: {levelId}</h2>
        <p>⚠️ This level is not implemented yet.</p>
      </div>
    );
  }

  if (!currentLevel) {
    return <div>Loading mission...</div>;
  }

  const safeProgress = migrateProgress(progress, selectedLevel.id);

  const levelProgress = safeProgress.levels?.[selectedLevel.id] || {
    phases: {}
  };

  const activePhaseId = getActivePhase(
    selectedLevel.phases,
    levelProgress
  );

  // ✅ GENERIC LEVEL COMPLETION CHECK
  function isLevelComplete(progress, level) {
    const progressPhases =
      progress?.levels?.[level.id]?.phases || {};

    const requiredPhases = level.phases.map((p) => p.id);

    return requiredPhases.every(
      (phaseId) => progressPhases[phaseId]?.completed === true
    );
  }

  // ✅ HANDLE LEVEL COMPLETION
  if (activePhaseId === "completed") {
    const unlocked = isLevelComplete(safeProgress, selectedLevel);

    return (
      <MissionComplete
        level={selectedLevel}
        unlocked={unlocked}
        onContinue={
          unlocked
            ? () => {
                const nextLevelId = "operation_shadow_escalation";

                const updatedProgress = {
                  ...progress,
                  meta: {
                    ...(progress.meta || {}),
                    currentLevel: nextLevelId
                  }
                };

                setProgress(updatedProgress);
                setLevelId(nextLevelId);
              }
            : null
        }
      />
    );
  }

  const phase = selectedLevel.phases.find(
    (p) => p.id === activePhaseId
  );

  if (!phase) {
    return (
      <div>
        <h2>{selectedLevel.title}</h2>
        <p>⚠️ Phase not found.</p>
      </div>
    );
  }

  if (!missionStarted && progress) {
    return (
      <div>
        <h2>{selectedLevel.title}</h2>
        <p style={{ fontSize: "0.8em" }}>
          Operator: {user.name}
        </p>

        <PhaseRenderer phase={phase} />
      </div>
    );
  }

  if (!missionStarted) {
    return <MissionBriefing />;
  }

  return (
    <div>
      <h2>{selectedLevel.title}</h2>
      <p style={{ fontSize: "0.8em" }}>
        Operator: {user.name}
      </p>

      <PhaseRenderer phase={phase} />
    </div>
  );
}