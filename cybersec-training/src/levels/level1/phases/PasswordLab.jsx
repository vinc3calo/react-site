import { useState, useRef } from 'react';
import { useMission } from '../../../context/MissionContext';
import { socket } from '../../../core/socket';

export default function PasswordLab() {
  const {
    user,
    progress,
    setProgress,
    nextPhase,
    currentLevel
  } = useMission();

  const levelId = currentLevel.id;

  const [hash] = useState('5f4dcc3b5aa765d61d8327deb882cf99');
  const [logs, setLogs] = useState('');
  const [running, setRunning] = useState(false);

  const [crackedPassword, setCrackedPassword] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  const [answers, setAnswers] = useState({
    attack: '',
    implication: '',
    action: ''
  });

  const [feedback, setFeedback] = useState('');

  // ✅ tracking
  const startTimeRef = useRef(null);
  const [attempts, setAttempts] = useState(
    progress?.levels?.[levelId]?.phases?.password?.attempts || 0
  );

  const startCracking = async () => {
    setRunning(true);
    setLogs('');
    setCrackedPassword(null);
    setShowContinue(false);
    setAnswers({ attack: '', implication: '', action: '' });
    setFeedback('');

    startTimeRef.current = Date.now();
    setAttempts(prev => prev + 1);

    const response = await fetch(`http://localhost:4000/crack-stream?hash=${hash}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullOutput = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullOutput += chunk;

      setLogs((prev) => prev + chunk);
    }

    setRunning(false);

    let detectedPassword = null;

    let match = fullOutput.match(/:([^\s]+)/);
    if (match) detectedPassword = match[1];

    if (!detectedPassword) {
      let altMatch = fullOutput.match(/\n([a-zA-Z0-9]+)\s+\(/);
      if (altMatch) detectedPassword = altMatch[1];
    }

    if (detectedPassword) {
      setCrackedPassword(detectedPassword);

      setTimeout(() => {
        setShowContinue(true);
      }, 1000);
    } else {
      console.log("Could not detect password. Output:", fullOutput);
    }
  };

  const handleAnswerChange = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const allCorrect =
    answers.attack === 'dictionary' &&
    answers.implication === 'weak_password' &&
    answers.action === 'reset_password';

  const handleContinue = () => {
    if (!allCorrect) {
      setFeedback('❌ Some answers are incorrect. Review your analysis.');
      return;
    }

    const timeTaken = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    const basePoints = 100;
    const attemptPenalty = (attempts - 1) * 10;
    const speedBonus = Math.max(30 - timeTaken, 0);

    const score = Math.max(basePoints - attemptPenalty + speedBonus, 0);

    const updatedProgress = {
      ...progress,
      levels: {
        ...(progress.levels || {}),
        [levelId]: {
          phases: {
            ...(progress.levels?.[levelId]?.phases || {}),
            password: {
              completed: true,
              correct: true,
              attempts,
              timeTaken,
              score
            }
          }
        }
      }
    };

    // ✅ update frontend
    setProgress(updatedProgress);

    // ✅ backend sync
    socket.emit("progress_update", {
      user: user.name,
      phase: "password",
      progress: updatedProgress
    });

    nextPhase();
  };

  return (
    <div className="panel">
      <h3>🔐 Password Cracking Operation</h3>

      <p>Target Hash:</p>
      <pre>{hash}</pre>

      <button onClick={startCracking} disabled={running}>
        {running ? 'Cracking in progress...' : 'Start Attack'}
      </button>

      <pre style={{ height: '200px', overflowY: 'auto' }}>
        {logs || 'Awaiting execution...'}
      </pre>

      {crackedPassword && (
        <div className="success-panel" style={{ marginTop: '15px' }}>
          <h4>🔓 Credentials Compromised</h4>
          <p>
            Recovered Password: <strong>{crackedPassword}</strong>
          </p>
        </div>
      )}

      {crackedPassword && (
        <div className="question-panel" style={{ marginTop: '15px' }}>
          <h4>🧠 Analysis Required</h4>

          <p><strong>1. What attack was used?</strong></p>
          <select
            value={answers.attack}
            onChange={(e) => handleAnswerChange('attack', e.target.value)}
          >
            <option value="">Select answer</option>
            <option value="bruteforce">Brute Force</option>
            <option value="dictionary">Dictionary Attack</option>
            <option value="rainbow">Rainbow Table</option>
          </select>

          <p style={{ marginTop: '10px' }}>
            <strong>2. What does this indicate?</strong>
          </p>
          <select
            value={answers.implication}
            onChange={(e) => handleAnswerChange('implication', e.target.value)}
          >
            <option value="">Select answer</option>
            <option value="encrypted">The system is encrypted</option>
            <option value="weak_password">The password is weak</option>
            <option value="invalid_hash">The hash is invalid</option>
          </select>

          <p style={{ marginTop: '10px' }}>
            <strong>3. What should be done next?</strong>
          </p>
          <select
            value={answers.action}
            onChange={(e) => handleAnswerChange('action', e.target.value)}
          >
            <option value="">Select answer</option>
            <option value="ignore">Ignore the result</option>
            <option value="reset_password">Reset password</option>
            <option value="shutdown">Shut down server</option>
          </select>

          {feedback && <p style={{ marginTop: '10px' }}>{feedback}</p>}
        </div>
      )}

      {showContinue && (
        <button
          onClick={handleContinue}
          disabled={!allCorrect}
          style={{
            marginTop: '15px',
            opacity: allCorrect ? 1 : 0.5
          }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}