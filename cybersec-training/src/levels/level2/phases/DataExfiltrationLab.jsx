import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from '../../../core/socket';

export default function DataExfiltrationLab() {
  const { progress, setProgress, currentLevel, user } = useMission();

  const levelId = currentLevel.id;
  const phaseId = "data_exfiltration";

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  // ✅ Simulated outbound traffic
  const trafficLogs = [
    { destination: "8.8.8.8", size: "2MB", time: "10:00" },
    { destination: "192.168.1.1", size: "500KB", time: "10:05" },
    { destination: "185.199.110.153", size: "950MB ⚠️", time: "02:45" }, // suspicious
    { destination: "1.1.1.1", size: "1MB", time: "10:10" }
  ];

  const maliciousTarget = "185.199.110.153";

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedTarget === maliciousTarget;

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

    // ✅ update local
    setProgress(updatedProgress);

    // 🔥 sync to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phaseId,
      progress: updatedProgress
    });

    if (!isCorrect) {
      alert("❌ Incorrect. Look for abnormal data transfer size and timing.");
    }
  };

  if (completed) {
    return (
      <div>
        <h3>Data Exfiltration Detected</h3>
        <p>✅ Suspicious data transfer identified!</p>
        <p>The attacker is extracting sensitive data.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Data Exfiltration Analysis</h3>

      <p>
        Analyze outbound network traffic and identify the suspicious destination.
      </p>

      <ul>
        {trafficLogs.map((log, index) => (
          <li key={index}>
            {log.destination} — {log.size} ({log.time})
          </li>
        ))}
      </ul>

      <h4>Select the suspicious destination:</h4>

      {trafficLogs.map((log, index) => (
        <label key={index} style={{ display: "block" }}>
          <input
            type="radio"
            name="target"
            value={log.destination}
            onChange={() => setSelectedTarget(log.destination)}
          />
          {log.destination}
        </label>
      ))}

      <button onClick={handleSubmit} disabled={!selectedTarget}>
        Submit Analysis
      </button>
    </div>
  );
}