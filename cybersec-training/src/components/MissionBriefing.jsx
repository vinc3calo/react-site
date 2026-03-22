import { useEffect, useState } from "react";
import { useMission } from "../context/MissionContext";

export default function MissionBriefing({ levelId }) {
  const { setMissionStarted } = useMission();
  const [mission, setMission] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/mission/${levelId}`)
      .then(res => res.json())
      .then(setMission);
  }, [levelId]);

  if (!mission) return <div>Loading mission...</div>;

  return (
    <div className="panel">
      <h2>🎖️ {mission.title}</h2>

      <p><strong>Cyber Defense Unit – Blue Team Exercise</strong></p>

      <hr />

      <p>{mission.description}</p>

      <hr />

      <h4>🎯 Your Objectives:</h4>
      <ul>
        {mission.objectives.map((obj, i) => (
          <li key={i}>{obj}</li>
        ))}
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