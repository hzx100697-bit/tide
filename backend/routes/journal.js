import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const entries = db.prepare('SELECT * FROM journal_entries ORDER BY created_at DESC').all();
  res.json(entries.map((e) => ({ ...e, emotions: JSON.parse(e.emotions) })));
});

router.post('/', (req, res) => {
  const { mood, emotions = [], note = '' } = req.body;
  if (!mood || mood < 1 || mood > 10) {
    return res.status(400).json({ error: 'mood 需要是 1-10 的整数' });
  }
  const info = db
    .prepare('INSERT INTO journal_entries (mood, emotions, note) VALUES (?, ?, ?)')
    .run(mood, JSON.stringify(emotions), note);
  const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(info.lastInsertRowid);
  res.json({ ...entry, emotions: JSON.parse(entry.emotions) });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM journal_entries WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// 近 N 天的趋势数据，供仪表盘图表使用
router.get('/stats/trend', (req, res) => {
  const days = Number(req.query.days) || 14;
  const rows = db
    .prepare(
      `SELECT date(created_at) as day, AVG(mood) as avgMood, COUNT(*) as count
       FROM journal_entries
       WHERE created_at >= datetime('now', ?)
       GROUP BY day ORDER BY day ASC`
    )
    .all(`-${days} days`);
  res.json(rows);
});

export default router;
