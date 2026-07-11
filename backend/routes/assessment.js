import express from 'express';
import db from '../db.js';

const router = express.Router();

// PHQ-9 标准题目（患者健康问卷抑郁量表）
export const PHQ9_QUESTIONS = [
  '做事时提不起劲或没有兴趣',
  '感到心情低落、沮丧或绝望',
  '入睡困难、睡不安稳或睡眠过多',
  '感觉疲倦或没有活力',
  '食欲不振或吃太多',
  '觉得自己很糟，或觉得自己很失败，或让自己或家人失望',
  '对事物专注有困难，例如阅读报纸或看电视时',
  '动作或说话速度缓慢到别人已经察觉，或正好相反 —— 烦躁或坐立不安、动来动去的情况更胜于平常',
  '有不如死掉或用某种方式伤害自己的念头'
];

const OPTIONS = [
  { value: 0, label: '完全没有' },
  { value: 1, label: '好几天' },
  { value: 2, label: '一半以上的天数' },
  { value: 3, label: '几乎每天' }
];

function severityFromScore(score) {
  if (score <= 4) return '极轻微';
  if (score <= 9) return '轻度';
  if (score <= 14) return '中度';
  if (score <= 19) return '中重度';
  return '重度';
}

router.get('/phq9/questions', (req, res) => {
  res.json({ questions: PHQ9_QUESTIONS, options: OPTIONS });
});

router.post('/phq9', (req, res) => {
  const { answers } = req.body; // 长度为 9 的数组，每项 0-3
  if (!Array.isArray(answers) || answers.length !== 9) {
    return res.status(400).json({ error: '需要提交 9 道题目的答案' });
  }
  const score = answers.reduce((sum, v) => sum + Number(v), 0);
  const severity = severityFromScore(score);
  const lastItemRisk = Number(answers[8]) > 0; // 第9题涉及自伤念头

  const info = db
    .prepare('INSERT INTO assessments (type, answers, score, severity) VALUES (?, ?, ?, ?)')
    .run('phq9', JSON.stringify(answers), score, severity);

  res.json({
    id: info.lastInsertRowid,
    score,
    severity,
    lastItemRisk,
    disclaimer:
      '本结果仅供自我觉察参考，不构成医学诊断。如分数持续偏高或出现自伤念头，请尽快联系专业医生或心理咨询师。'
  });
});

router.get('/history', (req, res) => {
  const rows = db.prepare("SELECT * FROM assessments WHERE type = 'phq9' ORDER BY created_at ASC").all();
  res.json(rows.map((r) => ({ ...r, answers: JSON.parse(r.answers) })));
});

export default router;
