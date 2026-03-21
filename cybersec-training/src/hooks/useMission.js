import { useState, useEffect } from 'react';
import { saveProgress } from '../api/api';

export default function useMission() {
  const [mission, setMission] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('mission');
    if (saved) setMission(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (mission) {
      localStorage.setItem('mission', JSON.stringify(mission));
      saveProgress(mission);
    }
  }, [mission]);

  const startMission = (student) => {
    setMission({
      student,
      phase: 1,
      flags: [],
      score: 0,
      startTime: Date.now()
    });
  };

  const completePhase = (flag) => {
    setMission(prev => ({
      ...prev,
      phase: prev.phase + 1,
      flags: [...prev.flags, flag],
      score: prev.score + 50
    }));
  };

  return { mission, startMission, completePhase };
}