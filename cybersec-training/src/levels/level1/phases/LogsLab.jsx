import { useState, useRef } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from "../../../core/socket";

export default function LogsLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase,
    currentLevel
  } = useMission();

  const levelId = currentLevel.id;

  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);

  // ✅ tracking
  const startTimeRef = useRef(Date.now());
  const [attempts, setAttempts] = useState(
    progress?.levels?.[levelId]?.phases?.logs?.attempts || 0
  );

  const handleSubmit = () => {
    if (!user || locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isCorrect = input.toLowerCase().includes("privilege");

    // ❌ WRONG ANSWER
    if (!isCorrect) {
      alert("Incorrect analysis");

      const updatedProgress = {
        ...progress,
        levels: {
          ...(progress.levels || {}),
          [levelId]: {
            phases: {
              ...(progress.levels?.[levelId]?.phases || {}),
              logs: {
                ...(progress.levels?.[levelId]?.phases?.logs || {}),
                attempts: newAttempts
              }
            }
          }
        }
      };

      setProgress(updatedProgress);

      socket.emit("progress_update", {
        user: user.name,
        phase: "logs",
        progress: updatedProgress
      });

      return;
    }

    // ✅ CORRECT ANSWER
    setLocked(true);

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
      levels: {
        ...(progress.levels || {}),
        [levelId]: {
          phases: {
            ...(progress.levels?.[levelId]?.phases || {}),
            logs: {
              completed: true,
              correct: true,
              attempts: newAttempts,
              timeTaken,
              score
            }
          }
        }
      }
    };

    // ✅ update frontend
    setProgress(updatedProgress);

    // ✅ sync backend
    socket.emit("progress_update", {
      user: user.name,
      phase: "logs",
      progress: updatedProgress
    });

    setTimeout(() => {
      nextPhase();
    }, 1000);
  };

  return (
    <div className="panel">
      <h3>📜 Log Investigation</h3>

      <p>Analyze the logs below:</p>

      <pre>
[LOGIN SUCCESS] user=admin IP=45.77.12.90  
[PRIV ESCALATION] admin → root
      </pre>

      <p>What suspicious activity occurred?</p>

      <input
        placeholder="Your answer"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={locked}
      />

      <button onClick={handleSubmit} disabled={locked}>
        Submit
      </button>
    </div>
  );
}