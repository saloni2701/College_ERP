import face_recognition
import os
import pickle
import cv2

BASE_DIR = "faces"
known_encodings = []
known_names = []

for person_name in os.listdir(BASE_DIR):
    person_dir = os.path.join(BASE_DIR, person_name)
    if not os.path.isdir(person_dir):
        continue
    for img_name in os.listdir(person_dir):
        img_path = os.path.join(person_dir, img_name)
        image = cv2.imread(img_path)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb, model="hog")
        encodings = face_recognition.face_encodings(rgb, boxes)
        for enc in encodings:
            known_encodings.append(enc)
            known_names.append(person_name)

# Save encodings
data = {"encodings": known_encodings, "names": known_names}
with open("encodings.pickle", "wb") as f:
    pickle.dump(data, f)

print("Face encodings trained and saved!")
