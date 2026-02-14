-- Tasks Table (Beyond Habits)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- coding, gym, diet, personal
  priority TEXT DEFAULT 'medium', -- low, medium, high
  status TEXT DEFAULT 'todo', -- todo, in_progress, completed, cancelled
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
