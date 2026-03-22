import { useEffect, useState } from "react";
import { useMission } from "../context/MissionContext";

export default function MissionBriefing({ levelId }) {
  const { setMissionStarted } = useMission();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!levelId) return;

    setLoading(true);

    fetch(`http://localhost:4000/mission/${levelId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Mission not found");
        }
        return res.json();
      })
      .then((data) => {
        setMission(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load mission:", err);
        setMission(null);
        setLoading(false);
      });
  }, [levelId]);

  // 🔄 Loading state
  if (loading) {
    return <div className="panel">Loading mission...</div>;
  }

  // ❌ Error / not found
  if (!mission) {
    return <div className="panel">Mission not found.</div>;
  }

  return (
    <div className="panel">
      <h2>🎖️ {mission.title}</h2>

      <p>
        <strong>Cyber Defense Unit – Blue Team Exercise</strong>
      </p>

      <hr />

      <p>{mission.description}</p>

      <hr />

      <h4>🎯 Your Objectives:</h4>
      <ul>
        {Array.isArray(mission.objectives) ? (
          mission.objectives.map((obj, index) => (
            <li key={index}>{obj}</li>
          ))
        ) : (
          <li>No objectives available</li>
        )}
      </ul>

      <button
        onClick={() => setMissionStarted(true)}
        style={{ marginTop: "20px" }}
      >
        ▶ Begin Operation
      </button>
    </div>
  );
}