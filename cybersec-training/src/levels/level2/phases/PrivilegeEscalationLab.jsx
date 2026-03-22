import { useState } from "react";
import { useMission } from "../../../context/MissionContext";
import { socket } from '../../../core/socket';

export default function PrivilegeEscalationLab() {
  const { progress, setProgress, currentLevel, user } = useMission();

  const levelId = currentLevel.id;
  const phaseId = "privilege_escalation";

  const [selectedUser, setSelectedUser] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  // ✅ Simulated system logs
  const logs = [
    { user: "alice", action: "login", time: "09:00" },
    { user: "bob", action: "access file", time: "09:10" },
    { user: "charlie", action: "login", time: "09:20" },
    { user: "alice", action: "sudo access granted", time: "02:13 ⚠️" }, // suspicious
    { user: "bob", action: "logout", time: "09:30" }
  ];

  const compromisedUser = "alice";

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedUser === compromisedUser;

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

    // ✅ Update local state
    setProgress(updatedProgress);

    // 🔥 Sync to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: phaseId,
      progress: updatedProgress
    });

    if (!isCorrect) {
      alert("❌ Incorrect. Look for unusual privilege activity.");
    }
  };

  if (completed) {
    return (
      <div>
        <h3>Privilege Escalation</h3>
        <p>✅ Privilege escalation detected!</p>
        <p>The attacker has gained elevated access.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Privilege Escalation Detection</h3>

      <p>
        Analyze system logs and identify the compromised user who gained elevated privileges.
      </p>

      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            {log.user} — {log.action} ({log.time})
          </li>
        ))}
      </ul>

      <h4>Select the compromised user:</h4>

      {["alice", "bob", "charlie"].map((userOption) => (
        <label key={userOption} style={{ display: "block" }}>
          <input
            type="radio"
            name="user"
            value={userOption}
            onChange={() => setSelectedUser(userOption)}
          />
          {userOption}
        </label>
      ))}

      <button onClick={handleSubmit} disabled={!selectedUser}>
        Submit Analysis
      </button>
    </div>
  );
}