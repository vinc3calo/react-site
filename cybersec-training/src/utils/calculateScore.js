// utils/calculateScore.js
import { PHASE_CONFIG } from "../config/missionConfig";

export function calculateScore(phaseId, attempts, timeTaken) {
  const config = PHASE_CONFIG[phaseId];

  if (!config) return 0;

  const {
    basePoints,
    attemptPenalty,
    maxTimeBonus,
    expectedTime
  } = config;

  const penalty = Math.max(0, (attempts - 1) * attemptPenalty);

  let speedBonus =
    maxTimeBonus * (1 - timeTaken / expectedTime);

  speedBonus = Math.max(0, speedBonus);

  const finalScore = basePoints - penalty + speedBonus;

  return Math.round(finalScore);
}

export function calculateTotalScore(progress) {
  if (!progress?.phases) return 0;

  return Object.values(progress.phases).reduce((total, phase) => {
    return total + (phase.score || 0);
  }, 0);
}