import { useEffect, useState } from "react";
import axios from "axios";
import { useMission } from "../context/MissionContext";
import { socket } from "../core/socket";

export const useRestoreSession = () => {
  const { setUser, setProgress, setCurrentPhase } = useMission();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("studentName");

    if (!name) {
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/student/${name}`);
        const student = res.data;

        console.log("🔄 Restoring:", student);

        setUser({ name });
        const safeProgress =
          student.progress &&
          typeof student.progress === "object" &&
          student.progress.phases
            ? student.progress
            : { phases: {} };

        setProgress(safeProgress);
        setCurrentPhase(student.currentPhase || null);

        socket.emit("progress_update", {
          user: student.name,
          phase: student.currentPhase,
          progress: student.progress
        });

      } catch (err) {
        console.log("No saved session");
        // ✅ DO NOTHING (like your original)
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  return loading;
};