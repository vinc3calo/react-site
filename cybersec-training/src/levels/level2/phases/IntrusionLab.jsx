import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from '../../../core/socket';

export default function IntrusionLab() {
  const { progress, setProgress, currentLevel, user } = useMission();

  const levelId = currentLevel.id;
  const phaseId = "intrusion";

  const [selectedIP, setSelectedIP] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const logs = [
    { ip: "192.168.1.10", time: "08:00" },
    { ip: "192.168.1.10", time: "09:00" },
    { ip: "45.33.21.90", time: "03:12" }, // suspicious
    { ip: "192.168.1.10", time: "10:00" }
  ];

  const correctIP = "45.33.21.90";

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedIP === correctIP;

    let score = 0;

    if (isCorrect) {
      score = Math.max(100 - newAttempts * 10 - timeTaken, 50);
      setCompleted(true);
    }

    const updatedProgress = {
      ...progress,
      levels: {
        ...(progress.levels || {}),
        [levelId]: {
          phases: {
            ...(progress.levels?.[levelId]?.phases || {}),
            [phaseId]: {
              completed: isCorrect,
              correct: isCorrect,
              attempts: newAttempts,
              timeTaken,
              score
            }
          }
        }
      }
    };

    // ✅ update local state
    setProgress(updatedProgress);

    // 🔥 CRITICAL FIX: send to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phaseId,
      progress: updatedProgress
    });

    if (!isCorrect) {
      alert("❌ Incorrect. Try again.");
    }
  };

  if (completed) {
    return (
      <div>
        <h3>Intrusion Detection</h3>
        <p>✅ Intrusion successfully identified!</p>
        <p>Great work, analyst.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Intrusion Detection</h3>

      <p>
        Analyze the login logs and identify the suspicious IP address.
      </p>

      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name="ip"
                value={log.ip}
                onChange={() => setSelectedIP(log.ip)}
              />
              {log.ip} — {log.time}
            </label>
          </li>
        ))}
      </ul>

      <button onClick={handleSubmit} disabled={!selectedIP}>
        Submit Analysis
      </button>
    </div>
  );
}