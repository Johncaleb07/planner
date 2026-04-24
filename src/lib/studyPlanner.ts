import { supabase } from "@/integrations/supabase/client";

export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "todo" | "doing" | "completed";
export type TimerMode = "pomodoro" | "deep-work" | "custom";

export type ScheduleBlock = {
  id: string;
  date: string;
  start: string;
  end: string;
  subject: string;
  priority: Priority;
  notes: string;
  color: "math" | "logic" | "english" | "bible";
  lastModified: number;
};

export type StudyTask = {
  id: string;
  title: string;
  subject: string;
  status: TaskStatus;
  priority: Priority;
  minutes: number;
  dueDate: string;
  lastModified: number;
};

export type StudyNote = {
  id: string;
  subject: string;
  title: string;
  content: string;
  revision: boolean;
  protectedNote: boolean;
  lastModified: number;
};

export type Reminder = {
  id: string;
  label: string;
  type: "water" | "food" | "break" | "study" | "sleep";
  time: string;
  enabled: boolean;
};

export type PlannerState = {
  profile: { name: string; exam: string; examDate: string; goalMinutes: number };
  schedule: ScheduleBlock[];
  tasks: StudyTask[];
  notes: StudyNote[];
  reminders: Reminder[];
  timer: { mode: TimerMode; secondsLeft: number; running: boolean; strict: boolean; subject: string };
  bible: { day: number; portion: string; reading: boolean; prayer: boolean };
  vault: { locked: boolean; encryptedPreview: string };
  updatedAt: number;
};

const today = new Date().toISOString().slice(0, 10);
export const STORAGE_KEY = "scheduleflow-planner-v1";
const LEGACY_STORAGE_KEY = "tancet-discipline-planner-v1";

export const defaultPlannerState: PlannerState = {
  profile: { name: "Focused Planner", exam: "Daily Schedule", examDate: "2026-05-10", goalMinutes: 300 },
  schedule: [
    { id: "s1", date: today, start: "06:30", end: "08:00", subject: "Deep Work", priority: "High", notes: "Most important task first", color: "math", lastModified: Date.now() },
    { id: "s2", date: today, start: "09:30", end: "10:30", subject: "Review Block", priority: "High", notes: "Check yesterday's pending work", color: "logic", lastModified: Date.now() },
    { id: "s3", date: today, start: "14:00", end: "15:00", subject: "Skill Practice", priority: "Medium", notes: "Focused practice with short notes", color: "english", lastModified: Date.now() },
    { id: "s4", date: today, start: "21:15", end: "21:35", subject: "Reflection", priority: "Low", notes: "Plan tomorrow and wind down", color: "bible", lastModified: Date.now() },
  ],
  tasks: [
    { id: "t1", title: "Finish the top priority task", subject: "Work", status: "doing", priority: "High", minutes: 75, dueDate: today, lastModified: Date.now() },
    { id: "t2", title: "Review pending items", subject: "Planning", status: "todo", priority: "High", minutes: 45, dueDate: today, lastModified: Date.now() },
    { id: "t3", title: "Update notes for quick revision", subject: "Notes", status: "completed", priority: "Medium", minutes: 25, dueDate: today, lastModified: Date.now() },
  ],
  notes: [
    { id: "n1", subject: "Maths", title: "Speed rules", content: "Avoid re-reading the full question. Mark units first, then solve.", revision: true, protectedNote: false, lastModified: Date.now() },
    { id: "n2", subject: "Mindset", title: "Sleepy hour rule", content: "Stand, drink water, solve one easy problem, then continue.", revision: true, protectedNote: true, lastModified: Date.now() },
  ],
  reminders: [
    { id: "r1", label: "Drink water", type: "water", time: "07:15", enabled: true },
    { id: "r2", label: "No phone break", type: "break", time: "10:30", enabled: true },
    { id: "r3", label: "Sleep shutdown", type: "sleep", time: "22:30", enabled: true },
  ],
  timer: { mode: "pomodoro", secondsLeft: 25 * 60, running: false, strict: true, subject: "Deep Work" },
  bible: { day: 42, portion: "Psalm 42 + John 6", reading: true, prayer: false },
  vault: { locked: true, encryptedPreview: "Goals and private notes are encrypted locally before Cloud sync." },
  updatedAt: Date.now(),
};

export function loadPlannerState(): PlannerState {
  if (typeof window === "undefined") return defaultPlannerState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved ? normalizePlannerState(JSON.parse(saved)) : defaultPlannerState;
  } catch {
    return defaultPlannerState;
  }
}

function normalizePlannerState(saved: Partial<PlannerState>): PlannerState {
  const merged: PlannerState = {
    ...defaultPlannerState,
    ...saved,
    profile: { ...defaultPlannerState.profile, ...saved.profile, exam: saved.profile?.exam === "TANCET" ? "Daily Schedule" : saved.profile?.exam || defaultPlannerState.profile.exam },
    timer: { ...defaultPlannerState.timer, ...saved.timer, subject: saved.timer?.subject === "Quantitative Aptitude" ? "Deep Work" : saved.timer?.subject || defaultPlannerState.timer.subject },
  };
  return {
    ...merged,
    schedule: uniqueBy(merged.schedule, (item) => `${item.date}-${item.start}-${item.end}-${item.subject.toLowerCase()}`),
    tasks: uniqueBy(merged.tasks, (item) => `${item.title.toLowerCase()}-${item.subject.toLowerCase()}-${item.dueDate}`),
  };
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function savePlannerState(state: PlannerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
}

export async function tryCloudSync(state: PlannerState) {
  if (typeof window === "undefined" || !navigator.onLine) return "offline";
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "signin-needed";
  const rows = state.schedule.map((item, index) => ({
    user_id: data.user.id,
    schedule_date: item.date,
    start_time: item.start,
    end_time: item.end,
    subject: item.subject,
    priority: item.priority,
    notes: item.notes,
    color_token: item.color,
    sort_order: index,
  }));
  await supabase.from("study_schedules").upsert(rows);
  return "synced";
}

export function downloadJsonBackup(state: PlannerState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `scheduleflow-backup-${today}.json`);
}

export async function exportTimetablePdf(schedule: ScheduleBlock[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFillColor(238, 248, 244);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(31, 48, 62);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Daily Schedule Planner", 18, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Printable strict planner • Latest update wins sync • Offline-ready", 18, 30);

  const x = [18, 48, 78, 125, 154];
  const widths = [30, 30, 47, 29, 38];
  const headers = ["Date", "Time", "Subject", "Priority", "Notes"];
  let y = 44;
  doc.setFillColor(81, 133, 151);
  doc.roundedRect(18, y, 174, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  headers.forEach((header, index) => doc.text(header, x[index] + 2, y + 7));
  y += 12;
  doc.setFont("helvetica", "normal");
  schedule.forEach((item, row) => {
    if (y > 270) {
      doc.addPage();
      y = 22;
    }
    doc.setFillColor(row % 2 ? 250 : 255, row % 2 ? 246 : 255, row % 2 ? 235 : 255);
    doc.roundedRect(18, y, 174, 16, 1.5, 1.5, "F");
    doc.setTextColor(31, 48, 62);
    const values = [item.date, `${item.start}–${item.end}`, item.subject, item.priority, item.notes || "—"];
    values.forEach((value, index) => doc.text(doc.splitTextToSize(value, widths[index] - 3), x[index] + 2, y + 6));
    y += 18;
  });
  doc.save(`scheduleflow-timetable-${today}.pdf`);
}

export async function exportTimetableDocx(schedule: ScheduleBlock[]) {
  const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, ShadingType, BorderStyle } = await import("docx");
  const border = { style: BorderStyle.SINGLE, size: 1, color: "D8D2C3" };
  const rows = [
    new TableRow({
      children: ["Date", "Time", "Subject", "Priority", "Notes"].map((text) =>
        new TableCell({
          shading: { fill: "DFF0E9", type: ShadingType.CLEAR },
          borders: { top: border, bottom: border, left: border, right: border },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true })] })],
        }),
      ),
    }),
    ...schedule.map((item) =>
      new TableRow({
        children: [item.date, `${item.start}–${item.end}`, item.subject, item.priority, item.notes || "—"].map((text) =>
          new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            children: [new Paragraph({ children: [new TextRun(text)] })],
          }),
        ),
      }),
    ),
  ];

  const document = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
        children: [
          new Paragraph({ children: [new TextRun({ text: "Daily Schedule Planner", bold: true, size: 34 })] }),
          new Paragraph({ children: [new TextRun("Printable planner exported from ScheduleFlow.")] }),
          new Paragraph({ children: [new TextRun("")] }),
          new Table({ width: { size: 10440, type: WidthType.DXA }, columnWidths: [1700, 1700, 2800, 1500, 2740], rows }),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `scheduleflow-timetable-${today}.docx`);
}

export async function encryptText(text: string, pin: string) {
  const data = new TextEncoder().encode(`${pin}:${text}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
