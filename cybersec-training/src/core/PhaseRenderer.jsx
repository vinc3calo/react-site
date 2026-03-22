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

export default function PhaseRenderer({ phase }) {  
  const { nextPhase, updatePhaseProgress, user } = useMission();

  const handleComplete = (data) => {
    console.log("EMITTING:", {
        user: user.name,
        phase: phase.id,
        progress: data
    });
    updatePhaseProgress(phase.id, {
      completed: true,
      ...data
    });
 
    socket.emit("progress_update", {
        user: user.name,
        phase: phase.id,
        progress: data
    });

    nextPhase();
  };

  const Component = componentMap[phase.component];

  if (!Component) {
    return <div>Phase not found</div>;
  }

  return <Component onComplete={handleComplete} />;
}