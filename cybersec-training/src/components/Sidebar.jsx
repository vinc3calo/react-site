import { useMission } from "../context/MissionContext";
import { calculateTotalScore } from "../utils/calculateScore";

export default function Sidebar() {
  const { user, progress } = useMission();

  const totalScore = calculateTotalScore(progress);

  const phases = progress?.phases || {};
  const completedCount = Object.values(phases).filter(p => p.completed).length;

  const totalPhases = 5; // adjust later
  const progressPercent = Math.round((completedCount / totalPhases) * 100);

  const currentPhase = Object.keys(phases).find(
    key => !phases[key]?.completed
  );

  return (
    <div style={styles.sidebar}>
      {/* 🧑 Profile */}
      <div style={styles.profile}>
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="avatar"
          style={styles.avatar}
        />
        <h3>{user?.name}</h3>
      </div>

      {/* 🏆 Score */}
      <div style={styles.card}>
        <h4>Total Score</h4>
        <p style={styles.score}>{totalScore}</p>
      </div>

      {/* 📍 Current Phase */}
      <div style={styles.card}>
        <h4>Current Phase</h4>
        <p>{currentPhase || "Completed"}</p>
      </div>

      {/* 📊 Progress */}
      <div style={styles.card}>
        <h4>Progress</h4>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`
            }}
          />
        </div>
        <p>{progressPercent}%</p>
      </div>

      {/* ⚡ Status */}
      <div style={styles.card}>
        <h4>Status</h4>
        <p>{progressPercent === 100 ? "Mission Complete" : "In Progress"}</p>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    background: "#111",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  profile: {
    textAlign: "center"
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%"
  },
  card: {
    background: "#1e1e1e",
    padding: "10px",
    borderRadius: "8px"
  },
  score: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#4caf50"
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "#333",
    borderRadius: "4px"
  },
  progressFill: {
    height: "100%",
    background: "#4caf50",
    borderRadius: "4px"
  }
};