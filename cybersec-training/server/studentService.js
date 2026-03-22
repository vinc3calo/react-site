export async function saveStudentProgress(db, username, progress) {
  try {
    console.log("💾 Writing to DB:", progress);

    await db.run(
      `
      INSERT INTO students (username, progress)
      VALUES (?, ?)
      ON CONFLICT(username) DO UPDATE SET progress = excluded.progress
      `,
      username,
      JSON.stringify(progress)
    );
  } catch (err) {
    console.error("❌ Failed to save progress:", err);
  }
}

export async function getStudent(db, username) {
  const row = await db.get(
    "SELECT * FROM students WHERE username = ?",
    username
  );

  if (!row) return null;

  let parsed = null;

  try {
    parsed = JSON.parse(row.progress);
  } catch (err) {
    console.error("❌ Bad progress JSON:", row.progress);
    parsed = { levels: {}, meta: {} };
  }

  return {
    username: row.username,
    progress: parsed
  };
}