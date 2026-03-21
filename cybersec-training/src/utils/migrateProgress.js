export function migrateProgress(progress, levelId) {
  if (!progress) {
    return {
      levels: {
        [levelId]: { phases: {} }
      }
    };
  }

  // ✅ already new format
  if (progress.levels) {
    const existingLevel = progress.levels[levelId] || { phases: {} };

    // 🔥 MERGE old + new safely
    return {
      levels: {
        ...progress.levels,
        [levelId]: {
          phases: {
            ...(progress.phases || {}), // 👈 OLD DATA
            ...(existingLevel.phases || {}) // 👈 NEW DATA (overrides)
          }
        }
      }
    };
  }

  // 🔥 convert old → new
  return {
    levels: {
      [levelId]: {
        phases: progress.phases || {}
      }
    }
  };
}