CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Student',
  exam_name TEXT NOT NULL DEFAULT 'TANCET',
  exam_date DATE,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 240 CHECK (daily_goal_minutes BETWEEN 0 AND 1440),
  mentor_tone TEXT NOT NULL DEFAULT 'strict-supportive' CHECK (char_length(mentor_tone) <= 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.study_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL CHECK (char_length(subject) <= 120),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  notes TEXT CHECK (char_length(notes) <= 1000),
  color_token TEXT NOT NULL DEFAULT 'math' CHECK (char_length(color_token) <= 40),
  sort_order INTEGER NOT NULL DEFAULT 0,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE TABLE public.study_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 180),
  subject TEXT CHECK (char_length(subject) <= 120),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'completed')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  due_date DATE,
  estimated_minutes INTEGER NOT NULL DEFAULT 30 CHECK (estimated_minutes BETWEEN 0 AND 1440),
  completed_at TIMESTAMPTZ,
  streak_day DATE,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.study_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (char_length(subject) <= 120),
  title TEXT NOT NULL CHECK (char_length(title) <= 180),
  content TEXT NOT NULL DEFAULT '' CHECK (char_length(content) <= 20000),
  is_revision BOOLEAN NOT NULL DEFAULT false,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  encrypted_payload TEXT,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.timer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('pomodoro', 'deep-work', 'custom')),
  subject TEXT CHECK (char_length(subject) <= 120),
  planned_minutes INTEGER NOT NULL CHECK (planned_minutes BETWEEN 1 AND 720),
  focused_minutes INTEGER NOT NULL DEFAULT 0 CHECK (focused_minutes BETWEEN 0 AND 720),
  break_minutes INTEGER NOT NULL DEFAULT 0 CHECK (break_minutes BETWEEN 0 AND 180),
  strict_mode BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reminder_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('water', 'food', 'break', 'study', 'sleep')),
  label TEXT NOT NULL CHECK (char_length(label) <= 120),
  enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME,
  repeat_minutes INTEGER CHECK (repeat_minutes BETWEEN 5 AND 1440),
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reminder_type, label)
);

CREATE TABLE public.bible_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_day INTEGER NOT NULL CHECK (plan_day BETWEEN 1 AND 365),
  reading_portion TEXT NOT NULL CHECK (char_length(reading_portion) <= 180),
  reading_completed BOOLEAN NOT NULL DEFAULT false,
  prayer_completed BOOLEAN NOT NULL DEFAULT false,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, progress_date)
);

CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (char_length(event_type) <= 80),
  subject TEXT CHECK (char_length(subject) <= 120),
  value_minutes INTEGER NOT NULL DEFAULT 0 CHECK (value_minutes BETWEEN 0 AND 1440),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.friend_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  share_timetable BOOLEAN NOT NULL DEFAULT true,
  share_progress BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id <> friend_id),
  UNIQUE (requester_id, friend_id)
);

CREATE TABLE public.vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 180),
  encrypted_payload TEXT NOT NULL,
  hint TEXT CHECK (char_length(hint) <= 180),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.touch_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own schedules" ON public.study_schedules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Friends can view shared schedules" ON public.study_schedules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.friend_links fl WHERE fl.status = 'accepted' AND fl.share_timetable = true AND fl.friend_id = auth.uid() AND fl.requester_id = study_schedules.user_id));
CREATE POLICY "Users manage own tasks" ON public.study_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Friends can view shared task progress" ON public.study_tasks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.friend_links fl WHERE fl.status = 'accepted' AND fl.share_progress = true AND fl.friend_id = auth.uid() AND fl.requester_id = study_tasks.user_id));
CREATE POLICY "Users manage own notes" ON public.study_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own timer sessions" ON public.timer_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own reminders" ON public.reminder_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own bible progress" ON public.bible_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own analytics" ON public.analytics_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own friend links" ON public.friend_links FOR ALL TO authenticated USING (auth.uid() = requester_id OR auth.uid() = friend_id) WITH CHECK (auth.uid() = requester_id OR auth.uid() = friend_id);
CREATE POLICY "Users manage own vault" ON public.vault_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_study_schedules_updated_at BEFORE UPDATE ON public.study_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_study_schedules_last_modified BEFORE UPDATE ON public.study_schedules FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();
CREATE TRIGGER update_study_tasks_updated_at BEFORE UPDATE ON public.study_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_study_tasks_last_modified BEFORE UPDATE ON public.study_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();
CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON public.study_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_study_notes_last_modified BEFORE UPDATE ON public.study_notes FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();
CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_reminder_settings_last_modified BEFORE UPDATE ON public.reminder_settings FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();
CREATE TRIGGER update_bible_progress_updated_at BEFORE UPDATE ON public.bible_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_bible_progress_last_modified BEFORE UPDATE ON public.bible_progress FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();
CREATE TRIGGER update_friend_links_updated_at BEFORE UPDATE ON public.friend_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON public.vault_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER touch_vault_items_last_modified BEFORE UPDATE ON public.vault_items FOR EACH ROW EXECUTE FUNCTION public.touch_last_modified();

CREATE INDEX idx_study_schedules_user_date ON public.study_schedules(user_id, schedule_date);
CREATE INDEX idx_study_tasks_user_status ON public.study_tasks(user_id, status);
CREATE INDEX idx_study_notes_user_subject ON public.study_notes(user_id, subject);
CREATE INDEX idx_timer_sessions_user_started ON public.timer_sessions(user_id, started_at DESC);
CREATE INDEX idx_analytics_events_user_date ON public.analytics_events(user_id, event_date);
CREATE INDEX idx_friend_links_friend_status ON public.friend_links(friend_id, status);