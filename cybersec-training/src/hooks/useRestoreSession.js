import { useEffect, useState } from "react";
import axios from "axios";
import { useMission } from "../context/MissionContext";
import { socket } from "../core/socket";

export const useRestoreSession = () => {
  const {
    setUser,
    setProgress,
    setCurrentPhase,
    setMissionStarted
  } = useMission();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("studentName");

    if (!name) {
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/student/${name}`
        );

        const student = res.data;

        console.log("🔄 Restoring:", student);

        // ✅ SET USER
        setUser({ name });

        // ✅ SAFE PROGRESS STRUCTURE
        const safeProgress =
          student.progress &&
          typeof student.progress === "object"
            ? {
                levels: student.progress.levels || {},
                meta: student.progress.meta || {}
              }
            : {
                levels: {},
                meta: {}
              };

        setProgress(safeProgress);

        // ✅ RESTORE CURRENT PHASE
        const restoredPhase =
          safeProgress.meta?.currentPhase || null;

        setCurrentPhase(restoredPhase);

        // 🔥 SMART MISSION START LOGIC
        // If user has a saved phase → resume mission
        if (restoredPhase) {
          setMissionStarted(true);
        } else {
          setMissionStarted(false);
        }

        // ✅ SYNC SOCKET (FULL STATE)
        socket.emit("progress_update", {
          user: name,
          phase: restoredPhase,
          progress: safeProgress
        });

      } catch (err) {
        console.log("No saved session");
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  return loading;
};