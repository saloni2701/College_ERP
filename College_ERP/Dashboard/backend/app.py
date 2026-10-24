from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO users (name,email,password) VALUES (?,?,?)",
        (data["name"], data["email"], data["password"])
    )
    conn.commit()
    return jsonify({"message": "Registered successfully"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (data["email"], data["password"])
    ).fetchone()

    if user:
        return jsonify(dict(user))
    return jsonify({"error": "Invalid credentials"}), 401

app.run(port=5000, debug=True)
