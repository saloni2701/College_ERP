require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- DB CONNECTION ---
let pool;
(async () => {
    pool = await mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "1406",
        database: process.env.DB_NAME || "srm_attendance",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log("MySQL Connected");
})();

// -------- REGISTER USER --------
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password]
        );
        res.json({ user: { id: result.insertId, name, email }, token: "dummy-token-" + result.insertId });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ error: "Server error", details: err });
    }
});

// -------- LOGIN USER --------
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [email, password]
        );
        if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });
        res.json({ token: "dummy-token", user: rows[0] });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- MARK ATTENDANCE --------
app.post("/api/attendance/mark", async (req, res) => {
    try {
        const { userId, status = "present", source = "face-system" } = req.body;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        await pool.execute(
            "INSERT INTO attendance (user_id, status, source) VALUES (?, ?, ?)",
            [userId, status, source]
        );
        res.json({ message: "Attendance marked", userId });
    } catch (err) {
        console.error("ATTENDANCE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------- GET ATTENDANCE BY USER --------
app.get("/api/attendance/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await pool.execute(
            "SELECT * FROM attendance WHERE user_id = ? ORDER BY recorded_at DESC",
            [userId]
        );
        res.json({ attendance: rows });
    } catch (err) {
        console.error("GET ATTENDANCE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
