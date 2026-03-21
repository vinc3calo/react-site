import { useMission } from "../context/MissionContext";

export default function MissionBriefing() {
  const { setMissionStarted } = useMission();

  return (
    <div className="panel">
      <h2>🎖️ Operation Shadow Entry</h2>

      <p><strong>Cyber Defense Unit – Blue Team Exercise</strong></p>

      <hr />

      <p>
        At <strong>02:13 hours</strong>, anomalous activity was detected within the
        <strong> Defense Logistics Network (DLN)</strong>.
      </p>

      <p>
        A workstation assigned to <strong>Personnel ID: JS-047 (Logistics Officer)</strong>
        initiated unauthorized access outside operational hours.
      </p>

      <p>
        Intelligence suggests a possible <strong>credential compromise</strong> and
        external infiltration.
      </p>

      <hr />

      <h4>🎯 Your Objectives:</h4>
      <ul>
        <li>Identify the intrusion vector</li>
        <li>Recover compromised credentials</li>
        <li>Trace adversary activity</li>
        <li>Contain the breach</li>
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