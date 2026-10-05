from flask import Flask, Response
import cv2
import face_recognition
import pickle
import requests
import time

app = Flask(__name__)

# Load encodings
with open("encodings.pickle", "rb") as f:
    data = pickle.load(f)

API_URL = "http://localhost:5000/api/attendance/mark"

USER_MAP = {
    "Sham": 1,
    "Saloni": 2,
    "Aryan": 3
}

camera = cv2.VideoCapture(0)

# To avoid multiple hits for same face
last_marked = {}
COOLDOWN = 10  # seconds


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
            name = "Unknown"

            if True in matches:
                index = matches.index(True)
                name = data["names"][index]

                user_id = USER_MAP.get(name)

                if user_id:
                    now = time.time()
                    last_time = last_marked.get(name, 0)

                    if now - last_time > COOLDOWN:
                        try:
                            requests.post(
                                API_URL,
                                json={
                                    "userId": user_id,
                                    "status": "present",
                                    "source": "face-web"
                                },
                                timeout=3
                            )
                            last_marked[name] = now
                            print("Attendance marked:", name)
                        except Exception as e:
                            print("API Error:", e)

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
    return """
    <h1>Face Recognition Attendance</h1>
    <img src="/video" width="700">
    """


if __name__ == "__main__":
    app.run(port=5000)
