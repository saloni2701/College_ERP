import cv2
import face_recognition
import pickle
import os
import requests
import csv
from datetime import datetime

# Load encodings
with open("encodings.pickle", "rb") as f:
    data = pickle.load(f)

API_URL = "http://localhost:5000/api/attendance/mark"

# Map names → IDs (same as yours)
USER_MAP = {
    "Sham": 1,
    "Saloni": 2,
    "Aryan": 3
}

# To avoid duplicate attendance in a session
marked = set()

# CSV File
CSV_FILE = "attendance.csv"

# Create CSV if not exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Date", "Time", "Status"])

def mark_csv(name):
    now = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")

    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, date, time, "Present"])

    print(f"[CSV] Attendance saved for {name} at {time}")

video_capture = cv2.VideoCapture(0)

while True:
    ret, frame = video_capture.read()
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = face_recognition.compare_faces(data["encodings"], face_encoding)
        name = "Unknown"

        if True in matches:
            matched_idx = matches.index(True)
            name = data["names"][matched_idx]

            if name not in marked:
                marked.add(name)

                # Backend API attendance
                user_id = USER_MAP.get(name)
                if user_id:
                    try:
                        requests.post(API_URL, json={
                            "userId": user_id,
                            "status": "present",
                            "source": "face-system"
                        })
                        print(f"[API] Attendance marked for {name}")
                    except:
                        print("API failed, but continuing...")

                # CSV log
                mark_csv(name)

        # Draw Green Box
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

        # Label Box
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom),
                      (0, 255, 0), cv2.FILLED)

        cv2.putText(frame, name, (left + 6, bottom - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

    cv2.imshow("Face Recognition Attendance", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()
