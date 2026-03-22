import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import { MissionProvider, useMission } from "../context/MissionContext";
import { useRestoreSession } from "../hooks/useRestoreSession";

import MainLayout from "../components/layout/MainLayout";

import MissionEngine from "../core/MissionEngine";
import InstructorDashboard from "../components/InstructorDashboard";

function AppContent() {
  const loading = useRestoreSession();
  const { progress } = useMission();

  const [currentLevel, setCurrentLevel] = useState(null);

  // ✅ FIX: wait until loading is done
  useEffect(() => {
    if (loading) return;

    setCurrentLevel(
      progress?.meta?.currentLevel ||
      "operation_shadow_entry"
    );
  }, [loading, progress]);

  // ✅ LOADING STATE
  if (loading || !currentLevel) {
    return <div>Resuming operation...</div>;
  }

  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={
            <MissionEngine
              levelId={currentLevel}
              setLevelId={setCurrentLevel}
            />
          }
        />

        <Route path="/dashboard" element={<InstructorDashboard />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <Router>
        <AppContent />
      </Router>
    </MissionProvider>
  );
}