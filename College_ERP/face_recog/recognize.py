import cv2
import face_recognition
import pickle

from api_service import AttendanceTracker, API_URL

# Load encodings
with open("encodings.pickle", "rb") as f:
    data = pickle.load(f)

# Saves to the database and attendance.csv, once per person per day
tracker = AttendanceTracker()
print("Attendance will be sent to:", API_URL)

video_capture = cv2.VideoCapture(0)

while True:
    ret, frame = video_capture.read()
    if not ret:
        print("Could not read from the camera.")
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = face_recognition.compare_faces(data["encodings"], face_encoding)
        name = "Unknown"

        if True in matches:
            matched_idx = matches.index(True)
            name = data["names"][matched_idx]
            tracker.handle(name, "face-system")

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
