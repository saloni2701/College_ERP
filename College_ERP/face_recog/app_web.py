"""Face-recognition attendance with the camera in the BROWSER.

Use this instead of app.py when the program runs on a computer without a webcam,
for example a GitHub Codespace. The browser opens your own camera, sends small
pictures to /recognize, and this server recognises faces and saves attendance
(database + attendance.csv) exactly like app.py does.

Run:  python app_web.py      then open port 5000 from the Ports tab.
"""
import pickle

import cv2
import face_recognition
import numpy as np
from flask import Flask, Response, jsonify, request

from api_service import API_URL, AttendanceTracker

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # a 480px JPEG is ~50 KB; refuse anything huge

with open("encodings.pickle", "rb") as f:
    data = pickle.load(f)
known_encodings = data["encodings"]
known_names = data["names"]

# Saves to the database and attendance.csv, once per person per day
tracker = AttendanceTracker()
print("Attendance will be sent to:", API_URL)


def identify(encoding):
    """Name of the closest known face, or None if nobody matches."""
    matches = face_recognition.compare_faces(known_encodings, encoding)
    if True not in matches:
        return None
    distances = face_recognition.face_distance(known_encodings, encoding)
    best = min((i for i, ok in enumerate(matches) if ok), key=lambda i: distances[i])
    return known_names[best]


@app.route("/recognize", methods=["POST"])
def recognize():
    raw = request.get_data()
    try:
        frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR) if raw else None
    except cv2.error:
        frame = None
    if frame is None:
        return jsonify(error="Could not read the image."), 400

    height, width = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations)

    faces = []
    for (top, right, bottom, left), encoding in zip(locations, encodings):
        name = identify(encoding)
        state, message = "unknown", ""
        if name:
            tracker.handle(name, "face-web")
            state, message = tracker.status(name)
        faces.append({
            "name": name,
            "state": state,
            "message": message,
            # position as fractions of the picture, so the page can draw it at any size
            "box": [top / height, right / width, bottom / height, left / width],
        })
    return jsonify(faces=faces)


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Face Recognition Attendance</title>
<link rel="icon" type="image/png" href="/logo.png">
<style>
  body { font-family: system-ui, "Segoe UI", Arial, sans-serif; margin: 24px; max-width: 760px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  #status { margin: 0 0 12px; color: #444; }
  .stage { position: relative; display: inline-block; max-width: 100%; background: #111; }
  video { display: block; max-width: 100%; width: 700px; }
  canvas#overlay { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  #log { padding-left: 18px; color: #333; }
  #log .bad { color: #a12; }
</style>
</head>
<body>
<h1>Face Recognition Attendance</h1>
<p id="status">Starting camera&hellip;</p>
<div class="stage"><video id="video" autoplay playsinline muted></video><canvas id="overlay"></canvas></div>
<ul id="log"></ul>
<script>
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const grab = document.createElement("canvas");
const MAX_WIDTH = 480;      // pictures are shrunk before sending: faster, and plenty to recognise a face
const INTERVAL_MS = 700;
let busy = false;
const lastShown = {};

const LABELS = { saved: "saved", pending: "saving...", error: "NOT saved", no_user_id: "no user id" };

async function start() {
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    await video.play();
  } catch (err) {
    statusEl.textContent = "Camera unavailable: " + err.message + ". Allow camera access for this site and reload.";
    return;
  }
  statusEl.textContent = "Camera on. Look at the camera.";
  setInterval(tick, INTERVAL_MS);
}

async function tick() {
  if (busy || !video.videoWidth) return;
  busy = true;
  try {
    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    grab.width = Math.round(video.videoWidth * scale);
    grab.height = Math.round(video.videoHeight * scale);
    grab.getContext("2d").drawImage(video, 0, 0, grab.width, grab.height);
    const blob = await new Promise((resolve) => grab.toBlob(resolve, "image/jpeg", 0.8));
    const res = await fetch("recognize", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
    if (!res.ok) throw new Error("server answered " + res.status);
    draw((await res.json()).faces);
  } catch (err) {
    statusEl.textContent = "Problem talking to the server: " + err.message;
  } finally {
    busy = false;
  }
}

function draw(faces) {
  overlay.width = video.clientWidth;
  overlay.height = video.clientHeight;
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.lineWidth = 3;
  ctx.font = "16px system-ui, Arial";

  for (const face of faces) {
    const [top, right, bottom, left] = face.box;
    const x = left * overlay.width, y = top * overlay.height;
    const w = (right - left) * overlay.width, h = (bottom - top) * overlay.height;
    const ok = face.name && face.state !== "error" && face.state !== "no_user_id";
    const colour = !face.name ? "#e0a800" : ok ? "#1c9c4a" : "#d0342c";
    const label = face.name ? face.name + " - " + (LABELS[face.state] || "") : "Unknown";

    ctx.strokeStyle = colour;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = colour;
    ctx.fillRect(x, y + h, Math.max(w, ctx.measureText(label).width + 12), 24);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x + 6, y + h + 17);

    if (face.name) report(face);
  }
}

// Add a line to the log only when a person's state changes
function report(face) {
  const text = face.name + ": " + (face.state === "saved" ? "attendance saved to the database"
    : face.state === "pending" ? "sending to the database..."
    : "NOT saved - " + face.message);
  if (lastShown[face.name] === text) return;
  lastShown[face.name] = text;
  const li = document.createElement("li");
  li.textContent = new Date().toLocaleTimeString() + "  " + text;
  if (face.state === "error" || face.state === "no_user_id") li.className = "bad";
  logEl.prepend(li);
  while (logEl.children.length > 8) logEl.lastChild.remove();
}

start();
</script>
</body>
</html>
"""


@app.route("/")
def home():
    return Response(PAGE, mimetype="text/html")


if __name__ == "__main__":
    # host 0.0.0.0 so the Codespaces port forwarder can reach it
    app.run(host="0.0.0.0", port=5000)
