import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

/* ================================
   🔌 SOCKET.IO SETUP
================================ */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🧠 in-memory student tracking
const DATA_FILE = "./students.json";

let students = {};

// 🔥 Load existing data
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE);
    students = JSON.parse(raw);
    console.log("Loaded saved student data");
  } catch (err) {
    console.error("Failed to load student data", err);
  }
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("dashboard_update", students);

  socket.on("progress_update", (data) => {
    const { user, phase, progress } = data;

    // ✅ FORCE SAFE PROGRESS STRUCTURE
    let safeProgress;

    if (
      progress &&
      typeof progress === "object" &&
      progress.phases &&
      typeof progress.phases === "object"
    ) {
      safeProgress = progress;
    } else {
      safeProgress = { phases: {} };
    }

    // ✅ PRESERVE EXISTING DATA (IMPORTANT)
    const existing = students[user] || {};

    students[user] = {
      name: user,
      currentPhase: phase,
      progress: safeProgress,
      lastActive: Date.now()
    };

    console.log("Progress update:", students);

    io.emit("dashboard_update", students);

    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
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

  /* 1️⃣ Check john.pot */

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

  /* 2️⃣ Write hash */

  fs.writeFileSync(hashFile, hash);

  /* 3️⃣ Run John */

  const john = spawn(johnPath, [
    "--format=raw-md5",
    "--wordlist=" + wordlist,
    "--rules",
    hashFile
  ]);

  john.stdout.on("data", (data) => {
    let message = data.toString();
    message = message.replace(/\x08/g, "");

    res.write(`data: ${JSON.stringify({
      type: "log",
      message
    })}\n\n`);
  });

  john.stderr.on("data", (data) => {
    let message = data.toString();
    message = message.replace(/\x08/g, "");

    res.write(`data: ${JSON.stringify({
      type: "log",
      message
    })}\n\n`);
  });

  /* 4️⃣ Show result */

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

app.get("/student/:name", (req, res) => {
  const { name } = req.params;

  const student = students[name];

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

/* ================================
   🚀 START SERVER
================================ */

server.listen(4000, () => {
  console.log("Cyber range backend running on port 4000");
});