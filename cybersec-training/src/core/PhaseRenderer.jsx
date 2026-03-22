import Phishing from "../levels/level1/phases/PhishingLab.jsx";
import PasswordLab from "../levels/level1/phases/PasswordLab.jsx";
import Network from "../levels/level1/phases/NetworkLab.jsx";
import Logs from "../levels/level1/phases/LogsLab.jsx";
import Incident from "../levels/level1/phases/ResponseLab.jsx";

import Intrusion from "../levels/level2/phases/IntrusionLab.jsx";
import LateralMovement from "../levels/level2/phases/LateralMovementLab.jsx";
import PrivilegeEscalation from "../levels/level2/phases/PrivilegeEscalationLab.jsx";
import DataExfiltration from "../levels/level2/phases/DataExfiltrationLab.jsx";
import Containment from "../levels/level2/phases/ContainmentLab.jsx";

import { useMission } from "../context/MissionContext";
import { socket } from "../core/socket";

const componentMap = {
  Phishing,
  PasswordLab,
  Network,
  Logs,
  Incident,
  Intrusion,
  LateralMovement,
  PrivilegeEscalation,
  DataExfiltration,
  Containment
};

export default function PhaseRenderer({ phase, levelId }) {
  const { nextPhase, user, progress, setProgress } = useMission();

  const handleComplete = (data = {}) => {
    console.log("✅ Completing phase:", phase.id);

    // 🔥 FULL SAFE PROGRESS UPDATE
    const updatedProgress = {
      levels: {
        ...(progress.levels || {}),
        [levelId]: {
          ...(progress.levels?.[levelId] || { phases: {} }),
          phases: {
            ...(progress.levels?.[levelId]?.phases || {}),
            [phase.id]: {
              completed: true,
              ...data
            }
          }
        }
      },

      // 🔥 CRITICAL: META HANDLING
      meta: {
        ...(progress.meta || {}),
        currentLevel: progress.meta?.currentLevel || levelId,
        currentPhase: phase.id // ✅ THIS FIXES YOUR REFRESH ISSUE
      }
    };

    console.log("📡 Saving progress:", updatedProgress);

    // ✅ Update local state
    setProgress(updatedProgress);

    // ✅ Persist to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phase.id,
      progress: updatedProgress
    });

    // ✅ Move to next phase (UI only)
    nextPhase();
  };

  const Component = componentMap[phase.component];

  if (!Component) {
    return <div>Phase not found</div>;
  }

  return (
    <Component
      onComplete={handleComplete}
      levelId={levelId} // 🔥 REQUIRED for phase components
    />
  );
}