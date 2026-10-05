import requests

API_URL = "http://localhost:5000/api/attendance/mark"

def mark_attendance(user_id, source="face-system"):
    try:
        res = requests.post(API_URL, json={"userId": user_id, "status": "present", "source": source})
        print(res.json())
    except Exception as e:
        print("Error marking attendance:", e)
