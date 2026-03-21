import { useState } from "react";
import { useMission } from "../context/MissionContext";

export default function StartScreen() {
  const { setUser } = useMission();
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name) return;

    setUser({ name });
    localStorage.setItem("studentName", name);

    // ✅ CREATE STUDENT IN BACKEND
    socket.emit("progress_update", {
      user: name,
      phase: "start",
      progress: { phases: {} }
    });
  };
  return (
    <div className="panel">
      <h2>🪖 Cyber Range Training</h2>

      <p>Enter your operator name to begin:</p>

      <input
        type="text"
        placeholder="e.g. Operator-01"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleStart} style={{ marginTop: "15px" }}>
        Enter Simulation →
      </button>
    </div>
  );
}