// SAMPLE DATA — placeholder values so every page has something to show.
// Replace each export with a call to your backend (see api.js) when it is ready.

export const MIN_ATTENDANCE = 75; // minimum attendance percentage required

export const COURSES = [
  { code: "CS301", name: "Operating Systems", faculty: "Dr. R. Sharma", credits: 4, attended: 12, total: 12 },
  { code: "CS302", name: "Database Management Systems", faculty: "Dr. A. Iyer", credits: 4, attended: 11, total: 12 },
  { code: "CS303", name: "Computer Networks", faculty: "Prof. S. Menon", credits: 3, attended: 11, total: 12 },
  { code: "CS304", name: "Software Engineering", faculty: "Prof. K. Rao", credits: 3, attended: 10, total: 12 },
  { code: "CS305", name: "Artificial Intelligence", faculty: "Dr. P. Nair", credits: 4, attended: 12, total: 12 },
];

export const TIMETABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const TIMETABLE_PERIODS = [
  "9:00 – 9:50",
  "10:00 – 10:50",
  "11:00 – 11:50",
  "1:00 – 1:50",
  "2:00 – 2:50",
];

// One row per period, one entry per day (null = free period).
export const TIMETABLE = [
  ["CS301", "CS302", "CS303", "CS304", "CS305"],
  ["CS302", "CS303", "CS304", "CS305", "CS301"],
  ["CS303", "CS304", "CS305", "CS301", "CS302"],
  ["CS302 Lab", "CS302 Lab", null, "CS303 Lab", "CS303 Lab"],
  ["CS305", null, "CS301", null, "CS304"],
];

export const EXAMS = [
  { code: "CS301", course: "Operating Systems", type: "Mid-Sem", date: "2026-11-09", time: "10:00 AM", venue: "Block A, Hall 2" },
  { code: "CS302", course: "Database Management Systems", type: "Mid-Sem", date: "2026-11-11", time: "10:00 AM", venue: "Block A, Hall 2" },
  { code: "CS303", course: "Computer Networks", type: "Mid-Sem", date: "2026-11-13", time: "10:00 AM", venue: "Block B, Hall 1" },
  { code: "CS304", course: "Software Engineering", type: "Mid-Sem", date: "2026-11-16", time: "10:00 AM", venue: "Block B, Hall 1" },
  { code: "CS305", course: "Artificial Intelligence", type: "Mid-Sem", date: "2026-11-18", time: "10:00 AM", venue: "Block A, Hall 3" },
];

export const RESULTS = [
  { semester: "Semester 1", credits: 22, sgpa: 8.4 },
  { semester: "Semester 2", credits: 24, sgpa: 8.7 },
  { semester: "Semester 3", credits: 24, sgpa: 8.9 },
  { semester: "Semester 4", credits: 22, sgpa: 9.1 },
];

export const FEES = [
  { item: "Tuition fee", amount: 85000, due: "2026-08-15", status: "Paid" },
  { item: "Hostel fee", amount: 40000, due: "2026-08-15", status: "Paid" },
  { item: "Library & lab fee", amount: 8000, due: "2026-08-15", status: "Paid" },
  { item: "Examination fee", amount: 6500, due: "2026-11-01", status: "Pending" },
  { item: "Placement training fee", amount: 5000, due: "2026-12-01", status: "Pending" },
];

export const NOTICES = [
  { id: 1, category: "Attendance", date: "2026-10-05", title: "Attendance submission deadline: 31st March 2025", body: "Submit any pending attendance corrections to your class coordinator before the deadline." },
  { id: 2, category: "Examinations", date: "2026-10-03", title: "Mid-Sem exams scheduled next month", body: "The detailed schedule is available on the Exams & Results page. Carry your ID card to every exam." },
  { id: 3, category: "Placements", date: "2026-10-01", title: "AI Resume Analyzer now available", body: "Upload your resume to get feedback on content quality, ATS friendliness and missing skills." },
  { id: 4, category: "Fees", date: "2026-09-28", title: "Examination fee payment window is open", body: "Pay the examination fee before the due date to receive your hall ticket." },
];
