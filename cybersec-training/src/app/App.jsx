import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { MissionProvider } from "../context/MissionContext";
import { useRestoreSession } from "../hooks/useRestoreSession"; // ✅ ADD

import MainLayout from "../components/layout/MainLayout";

import MissionEngine from "../core/MissionEngine";
import InstructorDashboard from "../components/InstructorDashboard";

function AppContent() {
  const loading = useRestoreSession(); // ✅ RUN RESTORE

  if (loading) {
    return <div>Resuming operation...</div>;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<MissionEngine />} />
        <Route path="/dashboard" element={<InstructorDashboard />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <Router>
        <AppContent /> {/* ✅ wrap here */}
      </Router>
    </MissionProvider>
  );
}