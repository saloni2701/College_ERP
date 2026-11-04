from flask import Flask, Response, send_from_directory
import cv2
import face_recognition
import pickle

from api_service import AttendanceTracker, API_URL

app = Flask(__name__)

# Load encodings
with open("encodings.pickle", "rb") as f:
    data = pickle.load(f)

camera = cv2.VideoCapture(0)

# Saves to the database and attendance.csv, once per person per day
tracker = AttendanceTracker()
print("Attendance will be sent to:", API_URL)


def gen_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        faces = face_recognition.face_locations(rgb)
        encodings = face_recognition.face_encodings(rgb, faces)

        for enc in encodings:
            matches = face_recognition.compare_faces(data["encodings"], enc)

            if True in matches:
                index = matches.index(True)
                name = data["names"][index]
                tracker.handle(name, "face-web")

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame +
            b'\r\n'
        )


@app.route("/video")
def video():
    return Response(
        gen_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/")
def home():
    return """<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Face Recognition Attendance</title>
      <link rel="icon" type="image/png" href="/static/favicon.png">
    </head>
    <body>
      <h1>Face Recognition Attendance</h1>
      <img src="/video" width="700">
    </body>
    </html>
    """


@app.route("/favicon.ico")
def favicon():
    # browsers ask for /favicon.ico by default; answer with the same logo
    return send_from_directory(app.static_folder, "favicon.png", mimetype="image/png")


if __name__ == "__main__":
    app.run(port=5000)
