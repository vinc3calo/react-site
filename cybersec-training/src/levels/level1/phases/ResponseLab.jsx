import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from "../../../core/socket";

export default function ResponseLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase
  } = useMission();

  const [locked, setLocked] = useState(false);

  const handleCorrect = () => {
    if (!user || locked) return;

    setLocked(true); // ✅ prevent double trigger

    const safePhases = progress?.phases || {};
    const prev = safePhases.incident || {};

    const updatedProgress = {
      ...progress,
      phases: {
        ...safePhases,
        incident: {
          ...prev,
          completed: true,
          correct: true,
          attempts: prev.attempts || 1
        }
      }
    };

    // ✅ update frontend
    setProgress(updatedProgress);

    // ✅ sync backend
    socket.emit("progress_update", {
      user: user.name,
      phase: "incident",
      progress: updatedProgress
    });

    // ✅ move to next phase
    setTimeout(() => {
      nextPhase();
    }, 1000);
  };

  const handleWrong = () => {
    if (locked) return;
    alert("Incorrect");
  };

  return (
    <div className="panel">
      <h3>Incident Response</h3>

      <p>What is the FIRST action you should take?</p>

      <button onClick={handleWrong} disabled={locked}>
        Ignore the alert
      </button>

      <button onClick={handleCorrect} disabled={locked}>
        Block attacker IP
      </button>

      <button onClick={handleWrong} disabled={locked}>
        Shutdown entire system
      </button>
    </div>
  );
}