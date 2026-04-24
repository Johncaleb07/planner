import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Flame,
  LayoutDashboard,
  Lock,
  Moon,
  Play,
  Plus,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Target,
  Timer,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  defaultPlannerState,
  downloadJsonBackup,
  exportTimetableDocx,
  exportTimetablePdf,
  loadPlannerState,
  savePlannerState,
  tryCloudSync,
  type PlannerState,
  type ScheduleBlock,
  type StudyTask,
  type TaskStatus,
} from "@/lib/studyPlanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScheduleFlow Planner" },
      { name: "description", content: "A clean offline-first schedule planner with to-do lists, focus timer, reminders, progress, and exports." },
      { property: "og:title", content: "ScheduleFlow Planner" },
      { property: "og:description", content: "A simple productivity website for daily planning, tasks, focus sessions, and printable schedules." },
    ],
  }),
  component: Index,
});

const modes = { pomodoro: 25 * 60, "deep-work": 50 * 60, custom: 40 * 60 } as const;
const quotes = ["Plan the day once. Execute it one block at a time.", "Start with ten focused minutes. Momentum follows.", "Clear schedules beat mental clutter."];
const navItems = [
  { label: "Schedule", href: "#schedule" },
  { label: "To-do", href: "#to-do" },
  { label: "Timer", href: "#timer" },
  { label: "Notes", href: "#notes" },
  { label: "Progress", href: "#progress" },
];

function Index() {
  const [state, setState] = useState<PlannerState>(defaultPlannerState);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"offline" | "signin-needed" | "synced" | "syncing">("offline");
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState("Work");
  const quote = quotes[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadPlannerState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePlannerState(state);
  }, [hydrated, state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => {
        if (!current.timer.running || current.timer.secondsLeft <= 0) return current;
        return { ...current, timer: { ...current.timer, secondsLeft: current.timer.secondsLeft - 1 }, updatedAt: Date.now() };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sync = async () => {
      setSyncStatus(navigator.onLine ? "syncing" : "offline");
      const result = await tryCloudSync(state).catch(() => (navigator.onLine ? "signin-needed" : "offline"));
      setSyncStatus(result as typeof syncStatus);
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, [state.updatedAt]);

  const completed = state.tasks.filter((task) => task.status === "completed").length;
  const progress = Math.round((completed / Math.max(state.tasks.length, 1)) * 100);
  const studyMinutes = state.schedule.reduce((total, item) => total + diffMinutes(item.start, item.end), 0);
  const timerLabel = `${Math.floor(state.timer.secondsLeft / 60).toString().padStart(2, "0")}:${(state.timer.secondsLeft % 60).toString().padStart(2, "0")}`;
  const streak = useMemo(() => Math.max(7, completed * 3 + state.bible.day % 5), [completed, state.bible.day]);

  function patchState(patch: Partial<PlannerState>) {
    setState((current) => ({ ...current, ...patch, updatedAt: Date.now() }));
  }

  function addTask() {
    if (!newTask.trim()) return;
    if (state.tasks.some((task) => task.title.toLowerCase() === newTask.trim().toLowerCase())) return;
    const task: StudyTask = { id: crypto.randomUUID(), title: newTask.trim().slice(0, 180), subject: newSubject.slice(0, 120), status: "todo", priority: "High", minutes: 30, dueDate: today(), lastModified: Date.now() };
    patchState({ tasks: [task, ...state.tasks] });
    setNewTask("");
  }

  function updateTask(id: string, status: TaskStatus) {
    patchState({ tasks: state.tasks.map((task) => (task.id === id ? { ...task, status, lastModified: Date.now() } : task)) });
  }

  function addScheduleBlock() {
    const block: ScheduleBlock = { id: crypto.randomUUID(), date: today(), start: "16:00", end: "17:00", subject: "Planning Block", priority: "High", notes: "Review, organize, and prepare the next action", color: "logic", lastModified: Date.now() };
    patchState({ schedule: [...state.schedule, block] });
  }

  function importBackup(file: File | undefined) {
    if (!file) return;
    file.text().then((text) => patchState(JSON.parse(text)));
  }

  function sharePlanner() {
    const summary = `My schedule: ${state.schedule.map((item) => `${item.start}-${item.end} ${item.subject}`).join(" | ")}`;
    if (navigator.share) navigator.share({ title: "Study Timetable", text: summary }).catch(() => undefined);
    else navigator.clipboard.writeText(summary);
  }

  return (
    <main
      className="coach-glow planner-grid min-h-screen overflow-hidden px-4 py-5 text-foreground sm:px-6 lg:px-8"
      onPointerMove={(event) => {
        const target = event.currentTarget;
        target.style.setProperty("--pointer-x", `${event.clientX}px`);
        target.style.setProperty("--pointer-y", `${event.clientY}px`);
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-2xl border border-border bg-card/90 p-4 shadow-soft backdrop-blur">
          <nav className="mb-5 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between" aria-label="Main menu">
            <div className="flex items-center gap-2 text-primary"><LayoutDashboard /><span className="font-serif text-2xl font-bold text-foreground">ScheduleFlow</span></div>
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => <a key={item.href} href={item.href} className="rounded-full bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">{item.label}</a>)}
            </div>
          </nav>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Offline first • Auto-saved • Cloud sync ready</p>
            <h1 className="mt-1 font-serif text-4xl font-bold text-foreground md:text-5xl">Daily Schedule Planner</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{quote}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={syncStatus} />
            <Button variant="focus" onClick={() => patchState({ timer: { ...state.timer, running: true } })}>
              <Play /> Start My Day
            </Button>
            <Button variant="quiet" onClick={() => patchState(defaultPlannerState)}>
              <RefreshCcw /> Emergency reset
            </Button>
          </div>
          </div>
        </header>

        <section id="schedule" className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Panel className="min-h-[360px]">
            <PanelTitle icon={<CalendarDays />} title="Smart study scheduler" action={<Button variant="coach" size="sm" onClick={addScheduleBlock}><Plus /> Block</Button>} />
            <div className="mt-4 grid gap-3">
              {state.schedule.map((item) => (
                <div key={item.id} draggable className="lift-on-hover grid gap-3 rounded-xl border border-border bg-surface-raised p-3 shadow-soft sm:grid-cols-[92px_1fr_92px] sm:items-center">
                  <div className="rounded-lg bg-secondary px-3 py-2 text-center text-sm font-bold text-secondary-foreground">{item.start}<br />{item.end}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${subjectDot(item.color)}`} />
                      <h2 className="font-semibold text-foreground">{item.subject}</h2>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{item.priority}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>
                  </div>
                  <select className="rounded-lg border border-input bg-background px-2 py-2 text-sm" value={item.priority} onChange={(event) => patchState({ schedule: state.schedule.map((block) => block.id === item.id ? { ...block, priority: event.target.value as ScheduleBlock["priority"] } : block) })}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="focus" onClick={() => exportTimetablePdf(state.schedule)}><Download /> Download PDF</Button>
              <Button variant="coach" onClick={() => exportTimetableDocx(state.schedule)}><FileText /> Download DOCX</Button>
              <Button variant="outline" onClick={sharePlanner}><Share2 /> Share</Button>
            </div>
          </Panel>

          <Panel id="timer">
            <PanelTitle icon={<Timer />} title="Focus timer" action={<span className="rounded-full bg-discipline px-3 py-1 text-xs font-bold text-primary-foreground">Focus {state.timer.strict ? "on" : "off"}</span>} />
            <div className="mt-5 rounded-2xl border border-border bg-surface-quiet p-5 text-center">
              <p className="text-sm font-semibold text-muted-foreground">{state.timer.mode.replace("-", " ")} • {state.timer.subject}</p>
              <div className="my-4 font-serif text-7xl font-bold text-primary">{timerLabel}</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(modes).map((mode) => <Button key={mode} variant={state.timer.mode === mode ? "focus" : "quiet"} size="sm" onClick={() => patchState({ timer: { ...state.timer, mode: mode as keyof typeof modes, secondsLeft: modes[mode as keyof typeof modes], running: false } })}>{mode}</Button>)}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="focus" onClick={() => patchState({ timer: { ...state.timer, running: !state.timer.running } })}>{state.timer.running ? "Pause" : "Start"}</Button>
                <Button variant="outline" onClick={() => patchState({ timer: { ...state.timer, secondsLeft: modes[state.timer.mode], running: false } })}>Reset</Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Metric label="Hours" value={`${Math.round(studyMinutes / 60)}h`} />
              <Metric label="Progress" value={`${progress}%`} />
              <Metric label="Streak" value={`${streak}d`} />
            </div>
          </Panel>
        </section>

        <section id="to-do" className="grid gap-4 lg:grid-cols-3">
          <Panel id="notes">
            <PanelTitle icon={<CheckCircle2 />} title="To-do list" />
            <div className="mt-4 flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a new to-do" maxLength={180} />
              <Button variant="focus" onClick={addTask}><Plus /></Button>
            </div>
            <input className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newSubject} onChange={(event) => setNewSubject(event.target.value)} maxLength={120} />
            <div className="mt-4 space-y-2">
              {state.tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-border bg-surface-raised p-3">
                  <div className="flex items-start gap-3">
                    <button className="mt-1 text-success" onClick={() => updateTask(task.id, task.status === "completed" ? "todo" : "completed")} aria-label="Toggle task"><CheckCircle2 className={task.status === "completed" ? "fill-success" : ""} /></button>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.subject} • {task.minutes} min • {task.priority}</p>
                    </div>
                    <select className="rounded-md border border-input bg-background px-2 py-1 text-xs" value={task.status} onChange={(event) => updateTask(task.id, event.target.value as TaskStatus)}>
                      <option value="todo">To Do</option><option value="doing">Doing</option><option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel id="progress">
            <PanelTitle icon={<Brain />} title="Notes + study vault" />
            <div className="mt-4 space-y-3">
              {state.notes.map((note) => (
                <article key={note.id} className="rounded-xl border border-border bg-surface-raised p-3">
                  <div className="flex items-center justify-between gap-2"><h2 className="font-semibold">{note.title}</h2>{note.protectedNote && <Lock className="text-primary" />}</div>
                  <p className="text-xs font-semibold text-primary">{note.subject} {note.revision ? "• quick revision" : ""}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{note.content}</p>
                </article>
              ))}
              <div className="rounded-xl border border-dashed border-primary bg-secondary/60 p-3 text-sm text-secondary-foreground"><ShieldCheck className="mb-2" /> Sensitive notes are prepared for local encryption before Cloud sync.</div>
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<Target />} title="Analytics + mentor" />
            <div className="mt-4 space-y-4">
              <Progress label="Daily completion" value={progress} />
              <Progress label="Goal minutes" value={Math.min(100, Math.round((studyMinutes / state.profile.goalMinutes) * 100))} />
              <Progress label="Bible + prayer" value={state.bible.reading && state.bible.prayer ? 100 : state.bible.reading ? 50 : 0} />
              <div className="rounded-xl bg-accent p-4 text-accent-foreground"><Flame className="mb-2" /><p className="font-semibold">Coach nudge</p><p className="text-sm">If you miss a session, restart with a 10-minute recovery block. No negotiation.</p></div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel>
            <PanelTitle icon={<BookOpen />} title="Bible + spiritual tracker" />
            <div className="mt-4 rounded-xl bg-subject-bible p-4 text-foreground">
              <p className="text-sm font-semibold">Day {state.bible.day} / 365</p>
              <h2 className="mt-1 font-serif text-2xl font-bold">{state.bible.portion}</h2>
              <div className="mt-4 flex gap-2">
                <Button variant={state.bible.reading ? "coach" : "quiet"} onClick={() => patchState({ bible: { ...state.bible, reading: !state.bible.reading } })}>Reading</Button>
                <Button variant={state.bible.prayer ? "coach" : "quiet"} onClick={() => patchState({ bible: { ...state.bible, prayer: !state.bible.prayer } })}>Prayer</Button>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<Moon />} title="Reminders, backup, restore" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {state.reminders.map((reminder) => <div key={reminder.id} className="rounded-xl border border-border bg-surface-raised p-3"><p className="font-semibold">{reminder.label}</p><p className="text-sm text-muted-foreground">{reminder.time} • {reminder.enabled ? "Enabled" : "Off"}</p></div>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => downloadJsonBackup(state)}><Download /> Export JSON</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload /> Import restore</Button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importBackup(event.target.files?.[0])} />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Panel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`rounded-2xl border border-border bg-card/92 p-4 shadow-soft backdrop-blur ${className}`}>{children}</section>;
}

function PanelTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-primary">{icon}<h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2></div>{action}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-surface-raised p-3"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="text-2xl font-bold text-primary">{value}</p></div>;
}

function Progress({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-sm font-semibold"><span>{label}</span><span>{value}%</span></div><div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>;
}

function StatusPill({ status }: { status: string }) {
  const online = status === "synced" || status === "syncing" || status === "signin-needed";
  return <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground">{online ? <Wifi /> : <WifiOff />} {status === "signin-needed" ? "Cloud ready • sign in to sync" : status}</span>;
}

function diffMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function subjectDot(color: ScheduleBlock["color"]) {
  return { math: "bg-subject-math", logic: "bg-subject-logic", english: "bg-subject-english", bible: "bg-subject-bible" }[color];
}
