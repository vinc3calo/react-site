import { useMission } from "../context/MissionContext";

export default function MissionComplete({ level }) {
  const { progress, setCurrentLevel } = useMission();

  const levelId = level.id;

  // ✅ get ONLY current level phases
  const phases = Object.values(
    progress?.levels?.[levelId]?.phases || {}
  );

  const totalScore = phases.reduce(
    (sum, p) => sum + (p.score || 0),
    0
  );

  const totalTime = phases.reduce(
    (sum, p) => sum + (p.timeTaken || 0),
    0
  );

  const getGrade = (score) => {
    if (score >= 450) return "A";
    if (score >= 350) return "B";
    if (score >= 250) return "C";
    return "D";
  };

  const handleNextLevel = () => {
    // ⚠️ temporary (we'll fix properly when adding level2)
    setCurrentLevel("level2");
  };

  return (
    <div className="mission-complete">
      <h1>🎉 Mission Complete</h1>
      <h2>{level.title}</h2>

      <div className="summary">
        <p>Score: <strong>{totalScore}</strong></p>
        <p>Time: <strong>{totalTime}s</strong></p>
        <p>Grade: <strong>{getGrade(totalScore)}</strong></p>
      </div>

      <button onClick={handleNextLevel}>
        Proceed to Level 2 →
      </button>
    </div>
  );
}