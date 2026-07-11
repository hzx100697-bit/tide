import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data', 'tide.db'));

db.pragma('journal_mode = WAL');

// 情绪日记：每条记录一次情绪打卡
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood INTEGER NOT NULL,              -- 1-10 情绪评分
    emotions TEXT NOT NULL DEFAULT '[]', -- JSON 数组，例如 ["焦虑","疲惫"]
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

// 心理测评记录（PHQ-9 等标准化量表）
db.exec(`
  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                 -- 'phq9'
    answers TEXT NOT NULL,              -- JSON 数组，逐题得分
    score INTEGER NOT NULL,
    severity TEXT NOT NULL,             -- 结果分级
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

// AI 对话会话
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT '新的对话',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,                 -- 'user' | 'assistant'
    content TEXT NOT NULL,
    flagged INTEGER NOT NULL DEFAULT 0, -- 是否命中危机词检测
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
  )
`);

// 呼吸练习完成记录（用于仪表盘统计）
db.exec(`
  CREATE TABLE IF NOT EXISTS breathing_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technique TEXT NOT NULL,            -- '4-7-8' | 'box' | 'coherent'
    duration_seconds INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

export default db;
