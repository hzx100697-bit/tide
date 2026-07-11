import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useApiKey } from '../ApiKeyContext.jsx';

export default function Chat() {
  const { apiKey } = useApiKey();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (activeId) api.getMessages(activeId).then(setMessages);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function refreshSessions() {
    const list = await api.listSessions();
    setSessions(list);
    if (list.length && !activeId) setActiveId(list[0].id);
  }

  async function handleNewSession() {
    const session = await api.createSession();
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim()) return;
    if (!apiKey) {
      setError('请先在左下角"设置 API Key"中填写你的 Anthropic API Key');
      return;
    }
    setError('');
    let sessionId = activeId;
    if (!sessionId) {
      const session = await api.createSession();
      setSessions((prev) => [session, ...prev]);
      sessionId = session.id;
      setActiveId(sessionId);
    }

    const userMsg = { role: 'user', content: input, id: `tmp-${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage(sessionId, userMsg.content, apiKey);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply, id: `tmp-a-${Date.now()}`, crisis: res.crisis }
      ]);
      refreshSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex">
      <div className="w-56 border-r border-line bg-surface flex flex-col">
        <div className="p-3">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-tide text-white text-sm hover:bg-tide-deep"
          >
            <i className="ti ti-plus" aria-hidden="true" /> 新对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                s.id === activeId ? 'bg-surface-alt font-medium' : 'text-ink-soft hover:bg-surface-alt'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-3 border-b border-line bg-surface-alt/60 flex items-center gap-2 text-xs text-ink-soft">
          <i className="ti ti-info-circle" aria-hidden="true" />
          这是 AI 生成的陪伴对话，不能替代专业心理咨询或医疗诊断。如遇紧急情况请拨打 12356 或前往医院。
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-ink-soft">
              <i className="ti ti-message-circle text-3xl mb-3" aria-hidden="true" />
              <p className="text-sm">想聊点什么都可以，我在这里听。</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-tide text-white rounded-br-sm'
                    : m.crisis
                    ? 'bg-crisis/10 border border-crisis/30 text-ink rounded-bl-sm'
                    : 'bg-surface border border-line rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-line px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-ink-soft">
                正在输入…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div className="px-6 py-2 text-xs text-crisis bg-crisis/5">{error}</div>}

        <div className="p-4 border-t border-line bg-surface flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="说说你现在的感受…"
            className="flex-1 border border-line rounded-full px-4 py-2.5 text-sm outline-none focus:border-tide"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-tide text-white flex items-center justify-center hover:bg-tide-deep disabled:opacity-50"
            aria-label="发送"
          >
            <i className="ti ti-send" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
