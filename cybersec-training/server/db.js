import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function initDB() {
  const db = await open({
    filename: "./cyberrange.db",
    driver: sqlite3.Database
  });

  // ✅ ORIGINAL SCHEMA (DO NOT CHANGE)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      progress TEXT
    )
  `);

  return db;
}