import { useState, useRef } from "react";
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

  // ✅ NEW: tracking
  const startTimeRef = useRef(Date.now());
  const [attempts, setAttempts] = useState(
    progress?.phases?.incident?.attempts || 0
  );

  const handleCorrect = () => {
    if (!user || locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    setLocked(true); // prevent double trigger

    const timeTaken = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    const basePoints = 100;
    const attemptPenalty = (newAttempts - 1) * 10;
    const speedBonus = Math.max(30 - timeTaken, 0);

    const score = Math.max(
      basePoints - attemptPenalty + speedBonus,
      0
    );

    const updatedProgress = {
      ...progress,
      phases: {
        ...(progress.phases || {}),
        incident: {
          completed: true,
          correct: true,
          attempts: newAttempts,
          timeTaken,
          score
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

    // ⚠️ optional (remove later if fully state-driven)
    setTimeout(() => {
      nextPhase();
    }, 1000);
  };

  const handleWrong = () => {
    if (locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    alert("Incorrect");

    const updatedProgress = {
      ...progress,
      phases: {
        ...(progress.phases || {}),
        incident: {
          ...(progress.phases?.incident || {}),
          attempts: newAttempts
        }
      }
    };

    setProgress(updatedProgress);

    socket.emit("progress_update", {
      user: user.name,
      phase: "incident",
      progress: updatedProgress
    });
  };

  return (
    <div className="panel">
      <h3>🚨 Incident Response</h3>

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