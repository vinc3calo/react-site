import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from '../../../core/socket';

export default function LateralMovementLab() {
  const { progress, setProgress, currentLevel, user } = useMission();

  const levelId = currentLevel.id;
  const phaseId = "lateral_movement";

  const [selectedHost, setSelectedHost] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  // ✅ Simulated internal traffic
  const networkLogs = [
    { source: "192.168.1.10", target: "192.168.1.12", time: "10:01" },
    { source: "192.168.1.10", target: "192.168.1.15", time: "10:05" },
    { source: "192.168.1.12", target: "192.168.1.20", time: "10:07" },
    { source: "192.168.1.200", target: "192.168.1.10", time: "02:13" }, // suspicious
    { source: "192.168.1.200", target: "192.168.1.12", time: "02:15" }  // suspicious
  ];

  const compromisedHost = "192.168.1.200";

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedHost === compromisedHost;

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

    // ✅ Update local
    setProgress(updatedProgress);

    // 🔥 Sync to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phaseId,
      progress: updatedProgress
    });

    if (!isCorrect) {
      alert("❌ Incorrect. Analyze the traffic patterns again.");
    }
  };

  if (completed) {
    return (
      <div>
        <h3>Lateral Movement Detection</h3>
        <p>✅ Compromised host identified!</p>
        <p>The attacker is moving inside the network.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Lateral Movement Detection</h3>

      <p>
        Analyze internal network traffic and identify the compromised machine.
      </p>

      <ul>
        {networkLogs.map((log, index) => (
          <li key={index}>
            {log.source} → {log.target} ({log.time})
          </li>
        ))}
      </ul>

      <h4>Select the compromised host:</h4>

      {["192.168.1.10", "192.168.1.12", "192.168.1.200"].map((host) => (
        <label key={host} style={{ display: "block" }}>
          <input
            type="radio"
            name="host"
            value={host}
            onChange={() => setSelectedHost(host)}
          />
          {host}
        </label>
      ))}

      <button onClick={handleSubmit} disabled={!selectedHost}>
        Submit Analysis
      </button>
    </div>
  );
}