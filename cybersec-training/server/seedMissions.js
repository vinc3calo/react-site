import { initDB } from "./db.js";

const db = await initDB();

async function seed() {
  // 🎖️ Mission
  await db.run(`
    INSERT OR REPLACE INTO missions (id, title, description, objectives)
    VALUES (?, ?, ?, ?)
  `,
    "operation_shadow_entry",
    "Operation Shadow Entry",
    "Anomalous activity detected in Defense Logistics Network...",
    JSON.stringify([
      "Identify the intrusion vector",
      "Recover compromised credentials",
      "Trace adversary activity",
      "Contain the breach"
    ])
  );

  // 🧱 Level
  await db.run(`
    INSERT OR REPLACE INTO levels (id, title)
    VALUES (?, ?)
  `,
    "operation_shadow_entry",
    "Operation Shadow Entry"
  );

  // 🎮 Phases
  const phases = [
    ["phishing", "Spear Phishing Detection", "Phishing"],
    ["password", "Credential Recovery", "PasswordLab"],
    ["network", "Network Intrusion Analysis", "Network"],
    ["logs", "System Log Forensics", "Logs"],
    ["incident", "Incident Response", "Incident"]
  ];

  for (const [id, title, component] of phases) {
    await db.run(`
      INSERT OR REPLACE INTO phases (id, levelId, title, component, config)
      VALUES (?, ?, ?, ?, ?)
    `,
      id,
      "operation_shadow_entry",
      title,
      component,
      JSON.stringify({
        basePoints: 100
      })
    );
  }

  console.log("✅ Mission seeded");
}

seed();