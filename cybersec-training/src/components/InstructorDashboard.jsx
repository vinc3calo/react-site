import { useEffect, useState } from "react";
import { socket } from "../core/socket";

export default function InstructorDashboard() {
  const [students, setStudents] = useState({});

  useEffect(() => {
    socket.on("dashboard_update", (data) => {
      setStudents(data);
    });

    return () => socket.off("dashboard_update");
  }, []);

  const getStatusColor = (lastActive) => {
    const diff = (Date.now() - new Date(lastActive)) / 1000;

    if (diff < 10) return "#00ff9f"; // active
    if (diff < 30) return "orange";  // idle
    return "red";                   // inactive
  };

  return (
    <div className="dashboard">
      <h2>👨‍🏫 Instructor Command Dashboard</h2>

      {Object.keys(students).length === 0 && (
        <p>No active operators...</p>
      )}

      <div className="grid">
        {Object.entries(students).map(([name, data]) => (
          <div className="card" key={name}>
            <h3>{data.name}</h3>

            <p>
              Status:
              <span
                style={{
                  color: getStatusColor(data.lastActive),
                  marginLeft: "5px"
                }}
              >
                ●
              </span>
            </p>

            <p>Phase: {data.currentPhase}</p>

            <p>
              Last Active:
              {new Date(data.lastActive).toLocaleTimeString()}
            </p>

            {/* 🔥 SCORE */}
            <p>
              Score: <strong>{data.score || 0}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}