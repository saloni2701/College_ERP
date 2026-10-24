require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8000; // 5000 is used by the face-attendance app; 6000 is blocked by browsers

// Browser origins allowed to call this API (the React app). Comma-separated.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// Shared secret the face-recognition system sends in the "x-api-key" header
// when it calls POST /api/attendance/mark. If unset, that route stays open
// (the old behaviour) and a warning is printed at startup.
const ATTENDANCE_API_KEY = process.env.ATTENDANCE_API_KEY || "";

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    JWT_SECRET = crypto.randomBytes(32).toString("hex");
    console.warn("WARNING: JWT_SECRET is not set in .env. Using a temporary secret - everyone will be signed out whenever the server restarts.");
}

const TOKEN_TTL = "8h";
const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS, // no fallback password in source code
    database: process.env.DB_NAME || "srm_attendance",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isBcryptHash = (value) => typeof value === "string" && /^\$2[aby]\$/.test(value);

function safeEqual(a, b) {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const publicUser = (row) => ({ id: row.id, name: row.name, email: row.email });
const signToken = (user) => jwt.sign({ sub: String(user.id) }, JWT_SECRET, { expiresIn: TOKEN_TTL });

function getUserFromRequest(req) {
    const match = (req.headers.authorization || "").match(/^Bearer (.+)$/i);
    if (!match) return null;
    try {
        return { id: String(jwt.verify(match[1], JWT_SECRET).sub) };
    } catch {
        return null;
    }
}

function requireAuth(req, res, next) {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "Please sign in to continue." });
    req.user = user;
    next();
}

// Simple in-memory brute-force protection for login.
const MAX_FAILED_LOGINS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const failedLogins = new Map(); // "ip|email" -> { count, resetAt }

const isLockedOut = (key) => {
    const entry = failedLogins.get(key);
    return Boolean(entry) && entry.resetAt > Date.now() && entry.count >= MAX_FAILED_LOGINS;
};
const recordFailedLogin = (key) => {
    const entry = failedLogins.get(key);
    if (!entry || entry.resetAt <= Date.now()) failedLogins.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
    else entry.count += 1;
};
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of failedLogins) if (entry.resetAt <= now) failedLogins.delete(key);
}, LOGIN_WINDOW_MS).unref();

// Returns true if the password matches. Accounts created before the upgrade
// still hold plain-text passwords; those are accepted once and upgraded to a hash.
async function verifyPassword(row, password) {
    if (isBcryptHash(row.password)) return bcrypt.compare(password, row.password);

    if (row.password != null && safeEqual(password, row.password)) {
        try {
            const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hash, row.id]);
        } catch (err) {
            console.warn("Could not upgrade password hash for user", row.id, "-", err.message,
                "(run migrations/001_widen_password_column.sql)");
        }
        return true;
    }
    return false;
}

// Plain-English explanation of common database failures (shown in the server console only).
function describeDbError(err) {
    switch (err.code) {
        case "ER_DATA_TOO_LONG":
            return "A value is too long for its column - most likely users.password. Run migrations/001_widen_password_column.sql.";
        case "ER_NO_SUCH_TABLE":
            return `A required table is missing in the database (${err.sqlMessage}).`;
        case "ER_BAD_FIELD_ERROR":
            return `The database is missing a column the server expects (${err.sqlMessage}).`;
        case "ER_NO_DEFAULT_FOR_FIELD":
            return `A required column has no default value, so the INSERT fails (${err.sqlMessage}).`;
        case "ER_ACCESS_DENIED_ERROR":
            return "MySQL refused the username/password in .env (DB_USER / DB_PASS).";
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// -------- REGISTER USER --------
app.post("/api/auth/register", async (req, res) => {
    try {
        const name = String(req.body?.name || "").trim();
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required." });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ error: "Please enter a valid email address." });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
        }

        const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hash]
        );

        const user = { id: result.insertId, name, email };
        res.status(201).json({ user, token: signToken(user) });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "An account with this email already exists." });
        }
        const hint = describeDbError(err);
        console.error("REGISTER ERROR:", hint ? `${hint} [${err.code}]` : err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- LOGIN USER --------
app.post("/api/auth/login", async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim();
        const password = String(req.body?.password || "");
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const attemptKey = `${req.ip}|${email.toLowerCase()}`;
        if (isLockedOut(attemptKey)) {
            return res.status(429).json({ error: "Too many failed attempts. Please try again in a few minutes." });
        }

        const [rows] = await pool.execute(
            "SELECT id, name, email, password FROM users WHERE email = ?",
            [email]
        );

        let matched = null;
        for (const row of rows) {
            if (await verifyPassword(row, password)) {
                matched = row;
                break;
            }
        }

        if (!matched) {
            recordFailedLogin(attemptKey);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        failedLogins.delete(attemptKey);
        const user = publicUser(matched); // never send the password back
        res.json({ token: signToken(user), user });
    } catch (err) {
        const hint = describeDbError(err);
        console.error("LOGIN ERROR:", hint ? `${hint} [${err.code}]` : err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- MARK ATTENDANCE --------
// Called by the face-recognition system (x-api-key header) or by a signed-in
// student for their own account.
app.post("/api/attendance/mark", async (req, res) => {
    try {
        const userId = Number(req.body?.userId);
        const status = req.body?.status ?? "present";
        const source = req.body?.source ?? "face-system";

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ error: "A valid userId is required." });
        }
        if (typeof status !== "string" || !status || status.length > 20 ||
            typeof source !== "string" || !source || source.length > 50) {
            return res.status(400).json({ error: "Invalid status or source." });
        }

        if (ATTENDANCE_API_KEY) {
            const keyOk = safeEqual(req.get("x-api-key") || "", ATTENDANCE_API_KEY);
            const tokenUser = getUserFromRequest(req);
            const selfOk = tokenUser && tokenUser.id === String(userId);
            if (!keyOk && !selfOk) {
                return res.status(401).json({ error: "Not authorised to mark attendance." });
            }
        }

        await pool.execute(
            "INSERT INTO attendance (user_id, status, source) VALUES (?, ?, ?)",
            [userId, status, source]
        );
        res.json({ message: "Attendance marked", userId });
    } catch (err) {
        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.errno === 1452) {
            const missingId = Number(req.body?.userId);
            console.warn(`Attendance rejected: there is no user with id ${missingId} in the users table.`);
            return res.status(404).json({
                error: `No user with id ${missingId} exists. Register that person in the portal first, ` +
                       "or correct USER_MAP in face_recog/api_service.py."
            });
        }
        console.error("ATTENDANCE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- GET ATTENDANCE BY USER (own records only) --------
app.get("/api/attendance/:id", requireAuth, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ error: "You can only view your own attendance." });
        }
        const [rows] = await pool.execute(
            "SELECT * FROM attendance WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 200",
            [req.user.id]
        );
        res.json({ attendance: rows });
    } catch (err) {
        console.error("GET ATTENDANCE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- Fallbacks (always JSON) --------
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON in request body." });
    console.error("UNHANDLED ERROR:", err);
    res.status(500).json({ error: "Server error" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function checkDatabase() {
    try {
        const [cols] = await pool.query("SHOW COLUMNS FROM users");
        const byName = Object.fromEntries(cols.map((c) => [c.Field, c]));

        for (const needed of ["name", "email", "password"]) {
            if (!byName[needed]) {
                console.warn(`WARNING: the users table has no "${needed}" column, so registration and login will fail.`);
            }
        }

        const pw = String(byName.password?.Type || "").match(/varchar\((\d+)\)/i);
        if (pw && Number(pw[1]) < 60) {
            console.warn(`WARNING: users.password is VARCHAR(${pw[1]}) - too short for hashed passwords. ` +
                "Run migrations/001_widen_password_column.sql before registering or logging in.");
        }

        // Registration only fills in name, email and password (id is auto-generated).
        // Any other required column without a default makes every INSERT fail.
        const blocking = cols
            .filter((c) => c.Null === "NO" && c.Default === null &&
                !String(c.Extra).includes("auto_increment") &&
                !["name", "email", "password"].includes(c.Field))
            .map((c) => c.Field);
        if (blocking.length > 0) {
            console.warn(`WARNING: users has required column(s) [${blocking.join(", ")}] that registration does not fill in, ` +
                "so every registration will fail. Give them a DEFAULT value or allow NULL.");
        }

        console.log("MySQL Connected");
    } catch (err) {
        const hint = describeDbError(err);
        console.error("Could not reach the database:", hint || err.message);
    }
}

app.listen(PORT, () => {
    console.log("Server running on", PORT);
    if (!ATTENDANCE_API_KEY) {
        console.warn("WARNING: ATTENDANCE_API_KEY is not set, so POST /api/attendance/mark is open to anyone.");
    }
    checkDatabase();
});
