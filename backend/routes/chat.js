import express from 'express';
import db from '../db.js';
import { detectCrisis, CRISIS_RESPONSE, SYSTEM_PROMPT } from '../safety.js';

const router = express.Router();

// 获取所有会话列表
router.get('/sessions', (req, res) => {
  const sessions = db.prepare('SELECT * FROM chat_sessions ORDER BY created_at DESC').all();
  res.json(sessions);
});

// 新建会话
router.post('/sessions', (req, res) => {
  const info = db.prepare('INSERT INTO chat_sessions (title) VALUES (?)').run('新的对话');
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(info.lastInsertRowid);
  res.json(session);
});

// 获取某会话的历史消息
router.get('/sessions/:id/messages', (req, res) => {
  const messages = db
    .prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC')
    .all(req.params.id);
  res.json(messages);
});

// 发送消息，调用大模型
router.post('/sessions/:id/messages', async (req, res) => {
  const sessionId = req.params.id;
  const { content, apiKey } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: '缺少 API Key，请在设置中填写' });
  }

  // 存储用户消息
  const isCrisis = detectCrisis(content);
  db.prepare(
    'INSERT INTO chat_messages (session_id, role, content, flagged) VALUES (?, ?, ?, ?)'
  ).run(sessionId, 'user', content, isCrisis ? 1 : 0);

  // 命中危机词：不调用大模型，直接返回安全响应
  if (isCrisis) {
    db.prepare(
      'INSERT INTO chat_messages (session_id, role, content, flagged) VALUES (?, ?, ?, ?)'
    ).run(sessionId, 'assistant', CRISIS_RESPONSE, 1);
    return res.json({ reply: CRISIS_RESPONSE, crisis: true });
  }

  try {
    const history = db
      .prepare('SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC')
      .all(sessionId);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', errBody);
      return res.status(response.status).json({ error: 'AI 服务调用失败，请检查 API Key 是否有效' });
    }

    const data = await response.json();
    const reply = data.content?.find((b) => b.type === 'text')?.text || '（未获取到回复）';

    db.prepare(
      'INSERT INTO chat_messages (session_id, role, content, flagged) VALUES (?, ?, ?, ?)'
    ).run(sessionId, 'assistant', reply, 0);

    // 首次对话时，用用户第一句话更新会话标题
    const msgCount = db.prepare('SELECT COUNT(*) AS c FROM chat_messages WHERE session_id = ?').get(sessionId).c;
    if (msgCount <= 2) {
      db.prepare('UPDATE chat_sessions SET title = ? WHERE id = ?').run(content.slice(0, 20), sessionId);
    }

    res.json({ reply, crisis: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

router.delete('/sessions/:id', (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(req.params.id);
  db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
