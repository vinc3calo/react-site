import { useState } from 'react';
import { useMission } from '../../../context/MissionContext';
import { socket } from '../../../core/socket';

export default function NetworkLab() {
  const { user, progress, setProgress, nextPhase } = useMission();

  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input !== '45.77.12.90') {
      alert('Incorrect IP');

      // optional: track attempts
      const updatedProgress = {
        ...progress,
        phases: {
          ...progress.phases,
          network: {
            ...progress.phases?.network,
            attempts: (progress.phases?.network?.attempts || 0) + 1
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

    // ✅ correct answer
    const updatedProgress = {
      ...progress,
      phases: {
        ...progress.phases,
        network: {
          completed: true,
          correct: true,
          attempts: (progress.phases?.network?.attempts || 0) + 1
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

    // ✅ move to next phase
    nextPhase();
  };

  return (
    <div className="panel">
      <h3>Network Traffic Analysis</h3>

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