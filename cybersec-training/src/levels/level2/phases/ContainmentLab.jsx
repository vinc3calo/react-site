import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from '../../../core/socket';

export default function ContainmentLab() {
  const { progress, setProgress, currentLevel, user } = useMission();

  const levelId = currentLevel.id;
  const phaseId = "containment";

  const [selectedActions, setSelectedActions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const actions = [
    "Isolate compromised host",
    "Revoke compromised credentials",
    "Block malicious IP",
    "Restart server",
    "Ignore alert"
  ];

  const correctActions = [
    "Isolate compromised host",
    "Revoke compromised credentials",
    "Block malicious IP"
  ];

  const toggleAction = (action) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const isCorrect =
      correctActions.every((a) => selectedActions.includes(a)) &&
      selectedActions.length === correctActions.length;

    let score = 0;

    if (isCorrect) {
      score = Math.max(120 - newAttempts * 10 - timeTaken, 60);
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

    // 🔥 sync to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phaseId,
      progress: updatedProgress
    });

    if (!isCorrect) {
      alert("❌ Incorrect response. Choose only the correct containment actions.");
    }
  };

  if (completed) {
    return (
      <div>
        <h3>Containment Successful</h3>
        <p>✅ Threat contained successfully!</p>
        <p>The attacker has been neutralized.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Incident Containment</h3>

      <p>
        Select the appropriate actions to contain the ongoing cyber attack.
      </p>

      {actions.map((action) => (
        <label key={action} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedActions.includes(action)}
            onChange={() => toggleAction(action)}
          />
          {action}
        </label>
      ))}

      <button
        onClick={handleSubmit}
        disabled={selectedActions.length === 0}
      >
        Execute Response
      </button>
    </div>
  );
}