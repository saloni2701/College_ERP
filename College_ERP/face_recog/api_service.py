"""Shared settings and attendance-saving logic for app.py and recognize.py.

Every recognised face is saved in two places:
  * the College_ERP database, through the Node backend  (POST /api/attendance/mark)
  * attendance.csv, as a local log

Settings come from environment variables or a ".env" file next to this file
(see .env.example).
"""
import csv
import os
import threading
import time
from datetime import date, datetime

import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_env_file(path):
    """Tiny .env reader so no extra package is needed. Real environment variables win."""
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file(os.path.join(BASE_DIR, ".env"))

# The Node backend. NOT port 5000: that is where this Flask app (app.py) runs.
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000").rstrip("/")
API_URL = f"{API_BASE_URL}/api/attendance/mark"

# Must match ATTENDANCE_API_KEY in the backend's .env (leave empty if the backend has none).
API_KEY = os.environ.get("ATTENDANCE_API_KEY", "")

CSV_FILE = os.path.join(BASE_DIR, "attendance.csv")

# Name (as stored in encodings.pickle) -> user id in the database `users` table.
# "Shambhavi" is the name the current encodings.pickle uses for Shambhavi; run
# train_faces.py again to switch it to the folder name "Shambhavi".
USER_MAP = {
    "Shambhavi Shukla": 1,
    "Saloni Chauhan": 2,
    "Aryan": 3,
    "Priyanshi Jindal": 4,
    "Sahaj Nagar": 5,
    "Sanvee Chauhan": 6,
    "Ganisha": 7,
    "Vivek Chauhan": 8,
}

RETRY_SECONDS = 10  # wait this long before retrying a failed database save


def mark_api(user_id, source):
    """Send one attendance record to the backend. Returns (ok, message)."""
    headers = {"x-api-key": API_KEY} if API_KEY else {}
    try:
        res = requests.post(
            API_URL,
            json={"userId": user_id, "status": "present", "source": source},
            headers=headers,
            timeout=5,
        )
    except requests.RequestException as err:
        return False, f"cannot reach the backend at {API_URL} ({type(err).__name__})"

    if res.ok:
        return True, "saved"

    try:
        detail = res.json().get("error", res.text[:100])
    except ValueError:
        detail = res.text[:100].strip() or "no details"
        if res.status_code == 404:
            detail += f" - is API_BASE_URL ({API_BASE_URL}) really the Node backend?"
    return False, f"backend answered {res.status_code}: {detail}"


def mark_csv(name):
    """Append one row to attendance.csv (creating it with a header if needed)."""
    now = datetime.now()
    is_new = not os.path.exists(CSV_FILE) or os.path.getsize(CSV_FILE) == 0
    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(["Name", "Date", "Time", "Status"])
        writer.writerow([name, now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S"), "Present"])
    print(f"[CSV] Attendance saved for {name} at {now.strftime('%H:%M:%S')}")


class AttendanceTracker:
    """Saves each recognised person once per day, per run, to the database AND the CSV.

    * CSV: written once, immediately.
    * Database: sent in a background thread so the video never freezes. If the backend
      is down or rejects the request, it is retried every RETRY_SECONDS until it works,
      so a short outage does not lose the record.
    """

    def __init__(self, background=True):
        self.background = background
        self._lock = threading.Lock()
        self._csv_day = {}
        self._api_day = {}
        self._last_attempt = {}
        self._warned = set()

    def handle(self, name, source):
        today = date.today()
        with self._lock:
            if self._csv_day.get(name) != today:
                self._csv_day[name] = today
                write_csv = True
            else:
                write_csv = False

            send_api = False
            user_id = USER_MAP.get(name)
            if self._api_day.get(name) != today:
                if user_id is None:
                    if name not in self._warned:
                        self._warned.add(name)
                        print(f"[DB] '{name}' is not in USER_MAP (api_service.py), so nothing is saved to the database.")
                elif time.time() - self._last_attempt.get(name, 0) >= RETRY_SECONDS:
                    self._last_attempt[name] = time.time()
                    send_api = True

        if write_csv:
            mark_csv(name)
        if send_api:
            if self.background:
                threading.Thread(target=self._send, args=(name, user_id, source, today), daemon=True).start()
            else:
                self._send(name, user_id, source, today)

    def _send(self, name, user_id, source, day):
        ok, message = mark_api(user_id, source)
        if ok:
            with self._lock:
                self._api_day[name] = day
            print(f"[DB] Attendance saved for {name} (user id {user_id})")
        else:
            print(f"[DB] NOT saved for {name}: {message}. Will retry.")


def mark_attendance(user_id, source="face-system"):
    """Kept for backward compatibility with the old api_service.py."""
    ok, message = mark_api(user_id, source)
    print("Attendance marked" if ok else f"Error marking attendance: {message}")
    return ok
