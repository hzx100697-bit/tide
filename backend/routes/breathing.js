import express from 'express';
import db from '../db.js';

const router = express.Router();

const TECHNIQUES = {
  '4-7-8': { inhale: 4, hold: 7, exhale: 8, label: '4-7-8 放松呼吸法' },
  box: { inhale: 4, hold: 4, exhale: 4, hold2: 4, label: '箱式呼吸法' },
  coherent: { inhale: 5, hold: 0, exhale: 5, label: '共振呼吸法' }
};

router.get('/techniques', (req, res) => {
  res.json(TECHNIQUES);
});

router.post('/complete', (req, res) => {
  const { technique, durationSeconds } = req.body;
  if (!TECHNIQUES[technique]) {
    return res.status(400).json({ error: '未知的呼吸练习类型' });
  }
  db.prepare('INSERT INTO breathing_sessions (technique, duration_seconds) VALUES (?, ?)').run(
    technique,
    durationSeconds || 0
  );
  res.json({ ok: true });
});

router.get('/stats', (req, res) => {
  const totalSessions = db.prepare('SELECT COUNT(*) as c FROM breathing_sessions').get().c;
  const totalSeconds = db.prepare('SELECT COALESCE(SUM(duration_seconds),0) as s FROM breathing_sessions').get().s;
  res.json({ totalSessions, totalSeconds });
});

export default router;
