// utils/getActivePhase.js

export function getActivePhase(phases, levelProgress) {
  if (!phases || phases.length === 0) return null;

  const progressPhases = levelProgress?.phases || {};

  // 🔁 Find first incomplete phase in ORDER
  for (let i = 0; i < phases.length; i++) {
    const phaseId = phases[i].id;

    if (!progressPhases[phaseId]?.completed) {
      return phaseId;
    }
  }

  // ✅ Only return "completed" if ALL phases are completed
  const allCompleted = phases.every(
    (p) => progressPhases[p.id]?.completed === true
  );

  return allCompleted ? "completed" : phases[0].id;
}