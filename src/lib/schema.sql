-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  invite_code TEXT UNIQUE,
  is_public_profile INTEGER DEFAULT 1,
  privacy_share_progress INTEGER DEFAULT 1,
  privacy_show_habits INTEGER DEFAULT 1,
  notifications_enabled INTEGER DEFAULT 1,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  category TEXT NOT NULL, -- coding, gym, diet, personal
  subcategory TEXT,
  habit_type TEXT NOT NULL, -- completion, counter, progress, duration
  counter_goal INTEGER,
  counter_unit TEXT,
  progress_goal INTEGER,
  progress_unit TEXT,
  duration_goal_minutes INTEGER,
  reminder_time TEXT,
  recurrence_pattern TEXT, -- daily, weekly, custom
  active_days TEXT, -- JSON: ["mon","tue","wed"]
  difficulty TEXT DEFAULT 'medium',
  xp_value INTEGER DEFAULT 25,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_paused INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habit Completions Table
CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completion_date TEXT NOT NULL,
  counter_value INTEGER,
  progress_value INTEGER,
  duration_minutes INTEGER,
  xp_earned INTEGER NOT NULL,
  notes TEXT,
  mood_rating INTEGER, -- 1-10
  completed_via TEXT, -- manual, timer, voice
  location TEXT,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(habit_id, completion_date)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- coding, gym, diet, personal
  subcategory TEXT,
  tags TEXT, -- JSON array
  priority TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'todo', -- todo, in_progress, completed, cancelled
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  time_accuracy_score REAL,
  scheduled_date TEXT, -- YYYY-MM-DD
  scheduled_time TEXT, -- HH:MM
  due_date TEXT, -- YYYY-MM-DD
  due_time TEXT, -- HH:MM
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT, -- daily, weekly, monthly, custom
  recurrence_config TEXT, -- JSON
  parent_task_id TEXT,
  has_subtasks INTEGER DEFAULT 0,
  completed_subtasks INTEGER DEFAULT 0,
  total_subtasks INTEGER DEFAULT 0,
  notes TEXT,
  external_links TEXT, -- JSON array
  attachments TEXT, -- JSON array
  xp_value INTEGER DEFAULT 20,
  difficulty_multiplier REAL DEFAULT 1.0,
  completed_at TEXT,
  completed_via TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Pomodoro Sessions Table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT, -- habit, task, none
  entity_id TEXT, -- habit_id or task_id
  category TEXT NOT NULL,
  session_type TEXT NOT NULL, -- work, short_break, long_break
  duration_minutes INTEGER NOT NULL,
  preset_name TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  paused_at TEXT,
  total_pause_duration_minutes INTEGER DEFAULT 0,
  was_completed INTEGER DEFAULT 0,
  was_interrupted INTEGER DEFAULT 0,
  interruption_reason TEXT,
  focus_score INTEGER, -- 1-10 self-rating
  distractions_count INTEGER DEFAULT 0,
  distraction_notes TEXT,
  notes TEXT,
  mood_before INTEGER, -- 1-10
  mood_after INTEGER, -- 1-10
  xp_earned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Time Logs Table
CREATE TABLE IF NOT EXISTS time_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- habit, task
  entity_id TEXT NOT NULL,
  category TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  session_id TEXT, -- link to pomodoro session
  notes TEXT,
  tags TEXT, -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES pomodoro_sessions(id) ON DELETE SET NULL
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  schedulable_type TEXT NOT NULL, -- habit, task
  schedulable_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT,
  end_time TEXT,
  estimated_duration_minutes INTEGER,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, missed, rescheduled
  notification_sent INTEGER DEFAULT 0,
  notification_time_minutes INTEGER DEFAULT 15,
  actual_start_time TEXT,
  actual_end_time TEXT,
  actual_duration_minutes INTEGER,
  rescheduled_from TEXT,
  rescheduled_reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Category Time Stats Table
CREATE TABLE IF NOT EXISTS category_time_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  habit_minutes INTEGER DEFAULT 0,
  task_minutes INTEGER DEFAULT 0,
  completed_habits INTEGER DEFAULT 0,
  total_habits INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  accuracy_percentage REAL,
  pomodoro_sessions INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,
  interrupted_pomodoros INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, category, date)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_key)
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, connected, blocked
  requested_by TEXT NOT NULL,
  connected_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Programs Table
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT,
  icon TEXT,
  color TEXT,
  total_days INTEGER NOT NULL,
  current_day INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date TEXT NOT NULL,
  end_date TEXT,
  completed_at TEXT,
  habit_ids TEXT,
  task_ids TEXT,
  daily_requirements TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
