import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDatabase() {
  await supabase.rpc('init_tables').catch(() => {});
}

export async function createTables() {
  await supabase.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      mood INTEGER NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => {});

  await supabase.query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      answers JSONB NOT NULL,
      score INTEGER NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => {});

  await supabase.query(`
    CREATE TABLE IF NOT EXISTS breathing_sessions (
      id SERIAL PRIMARY KEY,
      duration INTEGER NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => {});

  await supabase.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => {});
}