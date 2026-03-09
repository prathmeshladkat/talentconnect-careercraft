// routes/admins.js
import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; // built-in, no install needed

const router = express.Router();

// GET all admins
router.get("/", async (req, res) => {
  const [admins] = await db.query("SELECT id,email FROM admins");
  res.json(admins);
});

// POST create admin
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email & Password required" });

  const [existing] = await db.query("SELECT id FROM admins WHERE email=?", [email]);
  if (existing.length)
    return res.status(400).json({ error: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO admins (email,password) VALUES (?,?)",
    [email, hash]
  );
  res.status(201).json({ message: "Admin created!", id: result.insertId });
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email & Password required" });

  const [admins] = await db.query("SELECT * FROM admins WHERE email=?", [email]);
  if (!admins.length)
    return res.status(401).json({ error: "Invalid email/password" });

  const admin = admins[0];
  const match = await bcrypt.compare(password, admin.password);
  if (!match)
    return res.status(401).json({ error: "Invalid email/password" });

  // Generate a secure random token
  const token = crypto.randomBytes(48).toString("hex");

  // 15 days if rememberMe, otherwise 8 hours
  const durationMs = rememberMe
    ? 15 * 24 * 60 * 60 * 1000
    :  8 * 60 * 60 * 1000;

  const expiresAt = new Date(Date.now() + durationMs);

  // Clean up any old sessions for this admin first
  await db.query("DELETE FROM admin_sessions WHERE admin_id = ?", [admin.id]);

  // Save new session to DB
  await db.query(
    "INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)",
    [admin.id, token, expiresAt]
  );

  res.json({ message: "Login successful", token });
});

// GET /verify-token  — called on page load to auto-login
router.get("/verify-token", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "No token provided" });

  const [rows] = await db.query(
    `SELECT a.id, a.email
     FROM admin_sessions s
     JOIN admins a ON s.admin_id = a.id
     WHERE s.token = ? AND s.expires_at > NOW()`,
    [token]
  );

  if (!rows.length)
    return res.status(401).json({ error: "Session expired or invalid" });

  res.json({ valid: true, admin: rows[0] });
});

// POST /logout  — deletes session from DB
router.post("/logout", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) {
    await db.query("DELETE FROM admin_sessions WHERE token = ?", [token]);
  }
  res.json({ message: "Logged out successfully" });
});

// ── Middleware (export so other routes can use it) ──────────────────────────
export async function authenticateAdmin(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized" });

  const [rows] = await db.query(
    `SELECT a.id, a.email
     FROM admin_sessions s
     JOIN admins a ON s.admin_id = a.id
     WHERE s.token = ? AND s.expires_at > NOW()`,
    [token]
  );

  if (!rows.length)
    return res.status(401).json({ error: "Session expired" });

  req.admin = rows[0];
  next();
}

export default router;