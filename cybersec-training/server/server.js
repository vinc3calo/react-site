import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { initDB } from "./db.js";
import { saveStudentProgress, getStudent } from "./studentService.js";

const app = express();
app.use(cors());

const db = await initDB();

/* ================================
   🔌 SOCKET.IO SETUP
================================ */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

/* ================================
   🧠 IN-MEMORY CACHE
================================ */

let students = {};

/* ================================
   🔄 LOAD FROM DB
================================ */

async function loadStudentsFromDB() {
  const rows = await db.all("SELECT * FROM students");

  rows.forEach((row) => {
    try {
      const progress = JSON.parse(row.progress);

      students[row.username] = {
        name: row.username,
        currentPhase: progress?.meta?.currentPhase || null,
        progress,
        lastActive: Date.now()
      };
    } catch (err) {
      console.error("Bad row:", row);
    }
  });

  console.log("✅ Loaded students from SQLite");
}

await loadStudentsFromDB();

/* ================================
   🔌 SOCKET
================================ */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("dashboard_update", students);

  socket.on("get_dashboard", () => {
    socket.emit("dashboard_update", students);
  });


  socket.on("progress_update", async (data) => {
    const { user, phase, progress } = data || {};

    // 🔥 ignore bad events completely
    if (!user || typeof user !== "string" || !progress) {
      return;
    }

    const safeProgress =
      progress && progress.levels
        ? progress
        : { levels: {}, meta: {} };

    students[user] = {
      name: user,
      currentPhase: phase,
      progress: safeProgress,
      lastActive: Date.now()
    };

    await saveStudentProgress(db, user, safeProgress);

    io.emit("dashboard_update", students);
  });

  
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

/* ================================
   🔐 JOHN THE RIPPER (UNCHANGED)
================================ */

const johnPath = "C:\\Users\\user\\Downloads\\johnD\\run\\john.exe";
const wordlist = "C:\\Users\\user\\Downloads\\johnD\\run\\rockyou.txt";
const hashFile = "C:\\Users\\user\\Downloads\\johnD\\run\\hash.txt";
const potFile = "C:\\Users\\user\\Downloads\\johnD\\run\\john.pot";

app.get("/crack-stream", (req, res) => {
  const hash = req.query.hash;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (fs.existsSync(potFile)) {
    const potData = fs.readFileSync(potFile, "utf8");

    const line = potData
      .split("\n")
      .find((l) => l.includes(hash));

    if (line) {
      const password = line.split(":")[1];

      res.write(`data: ${JSON.stringify({
        type: "log",
        message: "Password already cracked previously."
      })}\n\n`);

      res.write(`data: ${JSON.stringify({
        type: "result",
        password,
        cached: true
      })}\n\n`);

      res.end();
      return;
    }
  }

  fs.writeFileSync(hashFile, hash);

  const john = spawn(johnPath, [
    "--format=raw-md5",
    "--wordlist=" + wordlist,
    "--rules",
    hashFile
  ]);

  john.stdout.on("data", (data) => {
    res.write(`data: ${JSON.stringify({
      type: "log",
      message: data.toString()
    })}\n\n`);
  });

  john.stderr.on("data", (data) => {
    res.write(`data: ${JSON.stringify({
      type: "log",
      message: data.toString()
    })}\n\n`);
  });

  john.on("close", () => {
    const show = spawn(johnPath, [
      "--show",
      "--format=raw-md5",
      hashFile
    ]);

    show.stdout.on("data", (data) => {
      const output = data.toString();

      let password = null;

      if (output.includes(":")) {
        password = output.split(":")[1].trim();
      }

      res.write(`data: ${JSON.stringify({
        type: "result",
        password
      })}\n\n`);

      res.end();
    });
  });
});

/* ================================
   📡 RESTORE SESSION
================================ */

app.get("/student/:name", async (req, res) => {
  const { name } = req.params;

  const student = await getStudent(db, name);

  if (!student) {
    return res.json({ progress: null });
  }

  res.json({
    progress: student.progress
  });
});

/* ================================
   🚀 START
================================ */

server.listen(4000, () => {
  console.log("Cyber range backend running on port 4000");
});