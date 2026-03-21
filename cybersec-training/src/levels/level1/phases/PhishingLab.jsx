import { useMission } from "../../../context/MissionContext";
import { socket } from "../../../core/socket";
import { useState, useRef } from "react";
import { calculateScore } from "../../../utils/calculateScore";

export default function PhishingLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase
  } = useMission();

  const [score, setScore] = useState(null);
  const [locked, setLocked] = useState(false);

  // ✅ NEW: consistent tracking
  const startTimeRef = useRef(Date.now());
  const [attempts, setAttempts] = useState(
    progress?.phases?.phishing?.attempts || 0
  );

  // ✅ HANDLE CORRECT
  const handleCorrect = () => {
    if (!user || locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setLocked(true);

    const timeTaken = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    const finalScore = calculateScore(
      "phishing",
      newAttempts,
      timeTaken
    );

    setScore(finalScore);

    const updatedProgress = {
      ...progress,
      phases: {
        ...(progress.phases || {}),
        phishing: {
          completed: true,
          correct: true,
          attempts: newAttempts,
          timeTaken,
          score: finalScore
        }
      }
    };

    // ✅ update frontend
    setProgress(updatedProgress);

    // ✅ sync backend
    socket.emit("progress_update", {
      user: user.name,
      phase: "phishing",
      progress: updatedProgress
    });

    // ⚠️ optional (remove later if fully state-driven)
    setTimeout(() => {
      nextPhase();
    }, 1500);
  };

  // ❌ HANDLE WRONG
  const handleWrong = () => {
    if (!user || locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    alert("Incorrect");

    const updatedProgress = {
      ...progress,
      phases: {
        ...(progress.phases || {}),
        phishing: {
          ...(progress.phases?.phishing || {}),
          attempts: newAttempts
        }
      }
    };

    setProgress(updatedProgress);

    socket.emit("progress_update", {
      user: user.name,
      phase: "phishing",
      progress: updatedProgress
    });
  };

  return (
    <div className="panel">
      <h3>📧 Phishing Analysis</h3>

      <p>
        An employee received the following email. Identify the suspicious element.
      </p>

      <pre>
From: security@company-support.com  
Subject: URGENT PASSWORD RESET  

Click here immediately:
http://secure-company-login.com/reset
      </pre>

      <p>Which indicator suggests this is a phishing attack?</p>

      <button onClick={handleCorrect} disabled={locked}>
        Suspicious domain name
      </button>

      <button onClick={handleWrong} disabled={locked}>
        Internal sender address
      </button>

      <button onClick={handleWrong} disabled={locked}>
        Proper formatting
      </button>
    </div>
  );
}