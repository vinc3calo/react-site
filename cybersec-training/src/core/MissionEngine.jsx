import { useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { level1 } from '../levels/level1';
import PhaseRenderer from './PhaseRenderer';
import MissionBriefing from '../components/MissionBriefing';
import StartScreen from '../components/StartScreen';
import MissionComplete from "../components/MissionComplete";
import { getActivePhase } from "../utils/getActivePhase";

export default function MissionEngine() {
  const {
    user,
    currentLevel,
    setCurrentLevel,
    missionStarted,
    progress
  } = useMission();

  useEffect(() => {
    if (!currentLevel) {
      setCurrentLevel(level1);
    }
  }, [currentLevel, setCurrentLevel]);

  if (!user) {
    return <StartScreen />;
  }

  if (!currentLevel) {
    return <div>Loading mission...</div>;
  }

  const activePhaseId = getActivePhase(
    currentLevel.phases,
    progress
  );

  if (activePhaseId === "completed") {
    return <MissionComplete level={currentLevel} />;
  }

  const phase = currentLevel.phases.find(
    (p) => p.id === activePhaseId
  );

  // Auto resume
  if (!missionStarted && progress) {
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