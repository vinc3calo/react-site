import { useEffect, useState } from "react";
import { socket } from "../core/socket";
import "../styles/leaderboard.css";

export default function InstructorDashboard() {
  const [students, setStudents] = useState({});

  useEffect(() => {
    socket.emit("get_dashboard");

    socket.on("dashboard_update", (data) => {
      setStudents(data || {});
    });

    return () => socket.off("dashboard_update");
  }, []);

  const getStatusColor = (lastActive) => {
    if (!lastActive) return "gray";

    const diff = (Date.now() - new Date(lastActive)) / 1000;
    if (diff < 10) return "#00ff9f";
    if (diff < 30) return "orange";
    return "red";
  };

  // ✅ SAFE NAME HANDLER (FIX)
  const getName = (student) => {
    return student?.name || "Unknown";
  };

  const getInitial = (student) => {
    const name = getName(student);
    return name.charAt(0).toUpperCase();
  };

  // 🔥 flatten ALL levels into one phases object
  const getAllPhases = (progress) => {
    if (!progress?.levels) return {};

    return Object.values(progress.levels).reduce((acc, level) => {
      return {
        ...acc,
        ...(level?.phases || {})
      };
    }, {});
  };

  const getTotalScore = (progress) => {
    const phases = getAllPhases(progress);

    return Object.values(phases).reduce(
      (sum, p) => sum + (p?.score || 0),
      0
    );
  };

  const getTotalTime = (progress) => {
    const phases = getAllPhases(progress);

    return Object.values(phases).reduce(
      (sum, p) => sum + (p?.timeTaken || 0),
      0
    );
  };

  const getProgress = (progress) => {
    const phases = getAllPhases(progress);

    const completed = Object.values(phases).filter(
      (p) => p?.completed
    ).length;

    const total = Object.keys(phases).length || 1;

    return Math.round((completed / total) * 100);
  };

  const getGrade = (score) => {
    if (score >= 450) return "A";
    if (score >= 350) return "B";
    if (score >= 250) return "C";
    return "D";
  };

  // 🔥 SAFE leaderboard build
  const leaderboard = Object.values(students || {})
    .filter((student) => student && student.progress) // ✅ prevent undefined crash
    .map((student) => {
      const totalScore = getTotalScore(student.progress);
      const totalTime = getTotalTime(student.progress);

      return {
        ...student,
        name: getName(student), // ✅ normalize name
        totalScore,
        totalTime,
        progressPercent: getProgress(student.progress),
        grade: getGrade(totalScore)
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.totalTime - b.totalTime;
    });

  // 🏆 Podium reorder
  const rawTopThree = leaderboard.slice(0, 3);
  const topThree = [
    rawTopThree[1],
    rawTopThree[0],
    rawTopThree[2]
  ].filter(Boolean);

  const rest = leaderboard.slice(3);

  const medals = ["🥈", "🥇", "🥉"];

  return (
    <div className="dashboard">
      <h2>👨‍🏫 Leaderboard</h2>

      {/* 🏆 PODIUM */}
      <div className="podium">
        {topThree.map((student, index) => (
          <div className={`podium-card pos-${index}`} key={student.name}>
            <div className="medal">{medals[index]}</div>

            <div className="avatar">
              {getInitial(student)}
            </div>

            <h3>{student.name}</h3>
            <p className="grade">{student.grade}</p>

            <p>Score: {student.totalScore}</p>
            <p>Time: {student.totalTime}s</p>

            <div>
              Status:
              <span
                style={{
                  color: getStatusColor(student.lastActive),
                  marginLeft: "5px"
                }}
              >
                ●
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 📊 TABLE */}
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Time</th>
            <th>Progress</th>
            <th>Grade</th>
            <th>Last Active</th>
          </tr>
        </thead>

        <tbody>
          {rest.map((student, index) => (
            <tr key={student.name}>
              <td>{index + 4}</td>
              <td>{student.name}</td>
              <td>{student.totalScore}</td>
              <td>{student.totalTime}s</td>
              <td>{student.progressPercent}%</td>
              <td>{student.grade}</td>
              <td>
                {student.lastActive
                  ? new Date(student.lastActive).toLocaleTimeString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}