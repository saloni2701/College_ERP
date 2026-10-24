// Single source of truth for sidebar links and the page title shown in the top bar.
export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ path: "/", label: "Dashboard", icon: "home", end: true }],
  },
  {
    label: "Academics",
    items: [
      { path: "/courses", label: "Courses", icon: "book" },
      { path: "/timetable", label: "Timetable", icon: "clock" },
      { path: "/face", label: "Attendance", icon: "calendar" },
      { path: "/exams", label: "Exams & Results", icon: "clipboard" },
    ],
  },
  {
    label: "Services",
    items: [
      { path: "/fees", label: "Fees", icon: "wallet" },
      { path: "/notices", label: "Notices", icon: "bell" },
      { path: "/resume", label: "Resume Analyzer", icon: "document" },
    ],
  },
  {
    label: "Account",
    items: [{ path: "/personal", label: "Personal Information", icon: "user" }],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

// External tools the portal links out to.
export const EXTERNAL_URLS = {
  attendance: "http://127.0.0.1:5000/",
  resumeAnalyzer: "http://localhost:8501",
};
