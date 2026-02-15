CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- coding, gym, diet, personal, academics, devotional
  priority TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'backlog', -- backlog, this_week, today, in_progress, completed
  completed INTEGER DEFAULT 0,
  
  -- 1-3-5 and Eisenhower Rule
  size TEXT DEFAULT 'small',
  quadrant TEXT DEFAULT 'q4',
  
  -- Time tracking
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  
  -- Scheduling
  scheduled_date TEXT, -- YYYY-MM-DD
  scheduled_time TEXT, -- HH:MM
  due_date TEXT, -- YYYY-MM-DD
  
  -- Recurrence
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT, -- daily, weekly, custom
  
  -- Links & Content
  notes TEXT,
  external_links TEXT, -- JSON array
  attachments TEXT, -- JSON array
  tags TEXT, -- JSON array
  
  -- Subtasks
  subtasks TEXT, -- JSON array of {id, title, completed}
  
  -- Timestamps
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Pomodoro Sessions Table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  habit_id TEXT,
  task_id TEXT,
  
  -- Session details
  session_type TEXT NOT NULL, -- work, short_break, long_break
  duration_minutes INTEGER NOT NULL,
  
  -- Session tracking
  started_at TEXT NOT NULL,
  completed_at TEXT,
  was_interrupted INTEGER DEFAULT 0,
  
  -- Productivity
  focus_score INTEGER, -- 1-10 self-rating
  distractions_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Time Logs Table
CREATE TABLE IF NOT EXISTS time_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT,
  task_id TEXT,
  
  category TEXT NOT NULL, -- coding, gym, diet, etc.
  
  -- Time tracking
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  
  -- Context
  notes TEXT,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Programs/Challenges Table
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT, -- 75_hard, morning_routine, custom
  
  -- Duration
  total_days INTEGER,
  current_day INTEGER DEFAULT 1,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, completed, paused, failed
  started_at TEXT,
  completed_at TEXT,
  
  -- Associated habits/tasks
  habit_ids TEXT, -- JSON array
  task_ids TEXT -- JSON array
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  
  -- What to schedule
  schedulable_type TEXT NOT NULL, -- habit, task
  schedulable_id TEXT NOT NULL,
  
  -- When
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT,
  
  -- Duration
  estimated_duration_minutes INTEGER,
  
  -- Status
  status TEXT DEFAULT 'scheduled' -- scheduled, in_progress, completed, missed
);

-- Category Time Analytics Table
CREATE TABLE IF NOT EXISTS category_time_stats (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  
  -- Time stats
  total_minutes INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  completed_habits INTEGER DEFAULT 0,
  
  -- Accuracy
  estimated_minutes INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  accuracy_percentage REAL,
  
  UNIQUE(category, date)
);

-- Task Scoring Data
CREATE TABLE IF NOT EXISTS task_scores (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  
  -- Component scores
  priority_score INTEGER DEFAULT 0,
  time_fit_score INTEGER DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  momentum_score INTEGER DEFAULT 0,
  energy_match_score INTEGER DEFAULT 0,
  
  -- Weighted total
  final_score INTEGER DEFAULT 0,
  
  -- Metadata
  calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  context TEXT, -- JSON string: {time, location, energy, etc}
  reason TEXT, -- Why this score
  
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Smart Suggestions History
CREATE TABLE IF NOT EXISTS smart_suggestions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  
  -- What was suggested
  suggested_task_id TEXT NOT NULL,
  rank INTEGER, -- 1st suggestion, 2nd option, etc
  
  -- Context at suggestion time
  time_available_minutes INTEGER,
  energy_level TEXT,
  current_time TEXT,
  day_of_week TEXT,
  
  -- User response
  action_taken TEXT, -- started, skipped, chose_other, ignored
  task_completed INTEGER DEFAULT 0,
  time_to_complete INTEGER,
  
  -- Accuracy tracking
  was_correct_suggestion INTEGER DEFAULT 0,
  feedback_score INTEGER, -- 1-5 stars
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suggested_task_id) REFERENCES tasks(id)
);

-- Energy & Productivity Patterns
CREATE TABLE IF NOT EXISTS user_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  
  -- Time-based patterns
  best_time_for_coding TEXT, -- HH:MM
  best_time_for_study TEXT,
  best_time_for_creative TEXT,
  peak_energy_time TEXT,
  
  -- Task preferences
  preferred_task_duration INTEGER,
  avg_focus_time INTEGER,
  break_frequency INTEGER,
  
  -- Historical data
  completion_rate_percentage INTEGER DEFAULT 0,
  avg_tasks_per_day INTEGER DEFAULT 0,
  
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
