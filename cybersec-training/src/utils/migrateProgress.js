export function migrateProgress(progress, levelId) {
  if (!progress) {
    return {
      levels: {
        [levelId]: { phases: {} }
      }
    };
  }

  // ✅ already new format
  if (progress.levels) return progress;

  // 🔥 convert old → new
  return {
    levels: {
      [levelId]: {
        phases: progress.phases || {}
      }
    }
  };
}