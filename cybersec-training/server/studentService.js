export async function saveStudentProgress(db, username, progress) {
  await db.run(
    `
    INSERT INTO students (username, progress)
    VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET progress = excluded.progress
    `,
    username,
    JSON.stringify(progress)
  );
}

export async function getStudent(db, username) {
  const row = await db.get(
    "SELECT * FROM students WHERE username = ?",
    username
  );

  if (!row) return null;

  return {
    username: row.username,
    progress: JSON.parse(row.progress)
  };
}