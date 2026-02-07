import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import fetch from "node-fetch";

import { sendConsultationConfirmationEmail } from "./utils/emailService.js";

import coursesRouter from "./routes/courses.js";
import faqsRouter from "./routes/faqs.js";
import partnersRouter from "./routes/partners.js";
import successStoriesRouter from "./routes/success_stories.js";
import siteStatsRouter from "./routes/site_stats.js";
import registrationsRouter from "./routes/registrations.js";
import adminsRouter from "./routes/admins.js";
import usersRouter from "./routes/users.js";
import consultationsRouter from "./routes/consultations.js";
import overviewRouter from "./routes/overview.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;



const allowedOrigins = [
  "https://admin.careerkrafter.in",
  "https://careerkrafter.in",
  "https://www.careerkrafter.in",
  "http://31.97.232.215:9090",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
  }

  // ✅ CRITICAL: handle preflight here
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


/* ---------------------- Middleware ---------------------- */
// ❌ REMOVED - Don't apply globally, it breaks multer!
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

/* ---------------------- DB Connection ---------------------- */
let sslConfig;
if ((process.env.DB_REQUIRE_SSL || "").toLowerCase() === "true") {
  const caPath = process.env.DB_CA || "./certs/tidb-ca.pem";
  if (fs.existsSync(caPath))
    sslConfig = { rejectUnauthorized: true, ca: fs.readFileSync(caPath) };
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

db.getConnection()
  .then((conn) => {
    console.log("✅ DB Connected");
    conn.release();
  })
  .catch((err) => console.error("❌ DB Connection Error:", err.message));

/* ---------------------- Admin Download CV ---------------------- */
app.get("/api/download-cv/:userId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      ` SELECT r.cv_url, r.cv_name
        FROM users u
        LEFT JOIN registrations r ON u.email = r.email
        WHERE u.id = ? `,
      [req.params.userId]
    );

    if (!rows.length || !rows[0].cv_url)
      return res.status(404).send("CV not found");

    const fileReq = await fetch(rows[0].cv_url);
    const buffer = await fileReq.arrayBuffer();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${rows[0].cv_name}"`,
    });
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Download CV error:", err);
    res.status(500).send("Error downloading CV");
  }
});

/* ---------------------- Debug Middleware ---------------------- */


/* ---------------------- API Routes ---------------------- */
// ✅ Routes with file uploads (multer handles body parsing)
app.use("/api/courses", coursesRouter);
app.use("/api/partners", partnersRouter);
app.use("/api/success_stories", successStoriesRouter);

// ✅ Routes that need JSON parsing
app.use("/api/faqs", express.json(), faqsRouter);
app.use("/api/site_stats", express.json(), siteStatsRouter);
app.use("/api/registrations", express.json(), registrationsRouter);
app.use("/api/admins", express.json(), adminsRouter);
app.use("/api/users", express.json(), usersRouter);
app.use("/api/consultations", express.json(), consultationsRouter);
app.use("/api/overview", express.json(), overviewRouter);

/* ---------------------- Health Check ---------------------- */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

/* ---------------------- Serve Frontend if deployed ---------------------- */
const frontendPath = path.resolve("..", "frontend");
if (fs.existsSync(path.join(frontendPath, "index.html"))) {
  app.use(express.static(frontendPath));
  app.get(/^\/(?!api).*/, (_req, res) =>
    res.sendFile(path.join(frontendPath, "index.html"))
  );
}

/* ---------------------- Error Handler ---------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Internal Error:", err.message);
  res.status(500).json({ error: err.message });
});

/* ---------------------- Start Server ---------------------- */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));