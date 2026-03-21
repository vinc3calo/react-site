import { useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { level1 } from '../levels/level1';
import PhaseRenderer from './PhaseRenderer';
import MissionBriefing from '../components/MissionBriefing';
import StartScreen from '../components/StartScreen';

export default function MissionEngine() {
  const {
    user,
    currentLevel,
    setCurrentLevel,
    currentPhaseIndex,
    setCurrentPhaseIndex,   // ✅ added
    currentPhase,           // ✅ added (from restore system)
    missionStarted,
    progress
  } = useMission();

  // ✅ Load level
  useEffect(() => {
    if (!currentLevel) {
      setCurrentLevel(level1);
    }
  }, [currentLevel, setCurrentLevel]);


  // 🔥 RESUME LOGIC (FIXED)
  useEffect(() => {
    if (!currentLevel || !progress) return;

    const phases = currentLevel.phases;

    let nextIndex = phases.findIndex(
      (p) => !progress?.phases?.[p.id]?.completed
    );

    if (nextIndex === -1) {
      nextIndex = phases.length - 1;
    }

    setCurrentPhaseIndex(nextIndex);

  }, [currentLevel]); // ✅ ONLY RUN ON LOAD
  
  console.log("PROGRESS:", progress);
  console.log("CURRENT PHASE:", currentPhase);
  console.log("PHASE INDEX:", currentPhaseIndex);

  // ✅ UI FLOW

  if (!user) {
    return <StartScreen />;
  }

  if (!currentLevel) {
    return <div>Loading mission...</div>;
  }

  // 🔥 IMPORTANT: Auto-start mission if resuming
  if (!missionStarted && currentPhase) {
    // bypass briefing if resuming
    const phase = currentLevel.phases[currentPhaseIndex];
    return (
      <div>
        <h2>{currentLevel.title}</h2>
        <p style={{ fontSize: "0.8em" }}>
          Operator: {user.name}
        </p>

        <PhaseRenderer phase={phase} />
      </div>
    );
  }

  if (!missionStarted) {
    return <MissionBriefing />;
  }

  const phase = currentLevel.phases[currentPhaseIndex];

  return (
    <div>
      <h2>{currentLevel.title}</h2>
      <p style={{ fontSize: "0.8em" }}>
        Operator: {user.name}
      </p>

      <PhaseRenderer phase={phase} />
    </div>
  );
}