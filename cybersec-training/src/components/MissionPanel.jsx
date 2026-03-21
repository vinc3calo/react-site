export default function MissionPanel({ mission }) {
  const progress = (mission.phase / 6) * 100;

  return (
    <div>
      <h2>Mission: Operation Shadow Entry</h2>
      <p>Student: {mission.student}</p>
      <p>Phase: {mission.phase}/6</p>
      <p>Score: {mission.score}</p>
      <p>Progress: {progress}%</p>
    </div>
  );
}