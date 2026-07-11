import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { EmptyState } from './Dashboard.jsx';

const EMOTION_TAGS = ['平静', '开心', '焦虑', '疲惫', '烦躁', '孤独', '感恩', '希望', '低落', '愤怒'];
const MOOD_LABELS = ['很糟', '糟糕', '不好', '一般偏差', '一般', '一般偏好', '不错', '好', '很好', '非常好'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  function loadEntries() {
    api.listJournal().then(setEntries);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.addJournal({ mood, emotions: selectedTags, note });
      setMood(5);
      setSelectedTags([]);
      setNote('');
      loadEntries();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await api.deleteJournal(id);
    loadEntries();
  }

  return (
    <div className="h-full overflow-y-auto px-10 py-8">
      <h1 className="font-display text-2xl mb-1">情绪日记</h1>
      <p className="text-sm text-ink-soft mb-6">花 30 秒，记录此刻的感受</p>

      <div className="bg-surface border border-line rounded-2xl p-6 mb-8">
        <label className="block text-sm font-medium mb-3">
          此刻的心情：<span className="text-tide">{MOOD_LABELS[mood - 1]}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="w-full accent-tide mb-6"
        />

        <label className="block text-sm font-medium mb-3">相关的情绪标签</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {EMOTION_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-tide text-white border-tide'
                  : 'border-line text-ink-soft hover:border-tide'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium mb-3">想多写一点吗？（可选）</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="发生了什么，让你有这样的感受？"
          className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-tide resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-tide text-white text-sm hover:bg-tide-deep disabled:opacity-50"
        >
          保存记录
        </button>
      </div>

      <h2 className="font-display text-lg mb-4">历史记录</h2>
      {entries.length === 0 ? (
        <EmptyState text="还没有记录" />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-surface border border-line rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-tide/10 flex items-center justify-center shrink-0 font-display text-tide">
                {e.mood}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium">{MOOD_LABELS[e.mood - 1]}</span>
                  {e.emotions.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-ink-soft">
                      {tag}
                    </span>
                  ))}
                </div>
                {e.note && <p className="text-sm text-ink-soft">{e.note}</p>}
                <p className="text-xs text-ink-soft/70 mt-1">{e.created_at}</p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="text-ink-soft hover:text-crisis"
                aria-label="删除这条记录"
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
