import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from "../../../core/socket";

export default function LogsLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase
  } = useMission();

  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);

  const handleSubmit = () => {
    if (!user || locked) return;

    const isCorrect = input.toLowerCase().includes("privilege");

    if (!isCorrect) {
      alert("Incorrect analysis");
      return;
    }

    setLocked(true); // ✅ prevent double trigger

    const safePhases = progress?.phases || {};
    const prev = safePhases.logs || {};

    const updatedProgress = {
      ...progress,
      phases: {
        ...safePhases,
        logs: {
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
      phase: "logs",
      progress: updatedProgress
    });

    // ✅ move forward (same pattern as others)
    setTimeout(() => {
      nextPhase();
    }, 1000);
  };

  return (
    <div className="panel">
      <h3>Log Investigation</h3>

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