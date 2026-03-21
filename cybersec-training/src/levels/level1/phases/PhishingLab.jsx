import { useMission } from "../../../context/MissionContext";
import { socket } from "../../../core/socket";
import { useState, useEffect } from "react";
import { calculateScore } from "../../../utils/calculateScore";

export default function PhishingLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase
  } = useMission();

  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState(null);
  const [locked, setLocked] = useState(false); // ✅ PREVENT DOUBLE TRIGGER

  // ✅ Start timer
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // ✅ HANDLE CORRECT
  const handleCorrect = () => {
    if (!user || locked) return; // ✅ BLOCK MULTIPLE CALLS

    setLocked(true); // ✅ LOCK IMMEDIATELY

    const safePhases = progress?.phases || {};
    const prevPhase = safePhases.phishing || {};

    const attempts = prevPhase.attempts || 1;

    const safeStart = startTime || Date.now();
    const timeTaken = Math.floor((Date.now() - safeStart) / 1000);

    const finalScore = calculateScore("phishing", attempts, timeTaken);

    setScore(finalScore);

    const updatedProgress = {
      ...progress,
      phases: {
        ...safePhases,
        phishing: {
          completed: true,
          correct: true,
          attempts,
          timeTaken,
          score: finalScore
        }
      }
    };

    // ✅ Update state
    setProgress(updatedProgress);

    // ✅ Sync backend
    socket.emit("progress_update", {
      user: user.name,
      phase: "phishing",
      progress: updatedProgress
    });

    // ✅ Move to next phase ONCE
    setTimeout(() => {
      nextPhase();
    }, 1500);
  };

  // ✅ HANDLE WRONG
  const handleWrong = () => {
    if (!user || locked) return;

    alert("Incorrect");

    const safePhases = progress?.phases || {};
    const prevPhase = safePhases.phishing || {};

    const updatedProgress = {
      ...progress,
      phases: {
        ...safePhases,
        phishing: {
          ...prevPhase,
          attempts: (prevPhase.attempts || 0) + 1
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
      <h3>Phishing Analysis</h3>

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

      {/* ✅ Score Feedback */}
      {score !== null && (
        <div style={{ marginTop: "15px", fontWeight: "bold", color: "#4caf50" }}>
          ✅ Correct! Score: {score}
        </div>
      )}
    </div>
  );
}