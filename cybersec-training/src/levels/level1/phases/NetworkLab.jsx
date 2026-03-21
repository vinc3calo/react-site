import { useState, useRef } from 'react';
import { useMission } from '../../../context/MissionContext';
import { socket } from '../../../core/socket';

export default function NetworkLab() {
  const { user, progress, setProgress, nextPhase } = useMission();

  const [input, setInput] = useState('');

  // ✅ NEW: tracking
  const startTimeRef = useRef(Date.now());
  const [attempts, setAttempts] = useState(
    progress.phases?.network?.attempts || 0
  );

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // ❌ WRONG ANSWER
    if (input !== '45.77.12.90') {
      alert('Incorrect IP');

      const updatedProgress = {
        ...progress,
        phases: {
          ...(progress.phases || {}),
          network: {
            ...(progress.phases?.network || {}),
            attempts: newAttempts
          }
        }
      };

      setProgress(updatedProgress);

      socket.emit("progress_update", {
        user: user.name,
        phase: "network",
        progress: updatedProgress
      });

      return;
    }

    // ✅ CORRECT ANSWER

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
        network: {
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

    // ✅ send to backend
    socket.emit("progress_update", {
      user: user.name,
      phase: "network",
      progress: updatedProgress
    });

    // ⚠️ optional (remove later if fully state-driven)
    nextPhase();
  };

  return (
    <div className="panel">
      <h3>🌐 Network Traffic Analysis</h3>

      <p>
        Review the captured network traffic and identify the attacker IP.
      </p>

      <pre>
SRC: 192.168.1.50  
DST: 45.77.12.90  
PROTO: HTTP
      </pre>

      <input
        placeholder="Enter attacker IP"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}