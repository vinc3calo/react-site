export function getActivePhase(phases, progress) {
  if (!progress?.phases) return phases[0]?.id;

  for (const phase of phases) {
    if (!progress.phases[phase.id]?.completed) {
      return phase.id;
    }
  }

  return "completed";
}