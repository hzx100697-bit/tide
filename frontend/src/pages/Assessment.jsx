import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api.js';
import { EmptyState } from './Dashboard.jsx';

const SEVERITY_COLOR = {
  极轻微: '#4C9498',
  轻度: '#1F6F72',
  中度: '#C98A3E',
  中重度: '#C46B33',
  重度: '#B0463C'
};

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getPhq9Questions().then(({ questions, options }) => {
      setQuestions(questions);
      setOptions(options);
    });
    loadHistory();
  }, []);

  function loadHistory() {
    api.assessmentHistory().then(setHistory);
  }

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const ordered = questions.map((_, i) => answers[i]);
      const res = await api.submitPhq9(ordered);
      setResult(res);
      setAnswers({});
      loadHistory();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto px-10 py-8 max-w-3xl">
      <h1 className="font-display text-2xl mb-1">心理测评</h1>
      <p className="text-sm text-ink-soft mb-2">PHQ-9 患者健康问卷抑郁量表</p>
      <p className="text-xs text-ink-soft mb-6">
        请回想过去两周，以下情况在你身上出现的频率。这不是诊断工具，结果仅供自我觉察参考。
      </p>

      {result ? (
        <ResultCard result={result} onRetake={() => setResult(null)} />
      ) : (
        <div className="space-y-5">
          {questions.map((q, i) => (
            <div key={i} className="bg-surface border border-line rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">
                {i + 1}. {q}
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt.value }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      answers[i] === opt.value
                        ? 'bg-tide text-white border-tide'
                        : 'border-line text-ink-soft hover:border-tide'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="px-5 py-2.5 rounded-lg bg-tide text-white text-sm hover:bg-tide-deep disabled:opacity-40"
          >
            提交测评
          </button>
        </div>
      )}

      <h2 className="font-display text-lg mt-10 mb-4">历史趋势</h2>
      {history.length === 0 ? (
        <EmptyState text="还没有测评记录" />
      ) : (
        <div className="bg-surface border border-line rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={history.map((h) => ({ ...h, day: h.created_at.slice(5, 10) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D3DEDB" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4E6367' }} />
              <YAxis domain={[0, 27]} tick={{ fontSize: 12, fill: '#4E6367' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D3DEDB', fontSize: 12 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#1F6F72" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, onRetake }) {
  const color = SEVERITY_COLOR[result.severity] || '#1F6F72';
  return (
    <div className="bg-surface border border-line rounded-2xl p-8 text-center">
      <p className="text-sm text-ink-soft mb-2">你的得分</p>
      <p className="font-display text-5xl mb-2" style={{ color }}>
        {result.score}
        <span className="text-lg text-ink-soft"> / 27</span>
      </p>
      <p className="inline-block px-3 py-1 rounded-full text-sm text-white mb-6" style={{ background: color }}>
        {result.severity}
      </p>

      {result.lastItemRisk && (
        <div className="bg-crisis/10 border border-crisis/30 rounded-xl p-4 text-sm text-left mb-6">
          <p className="font-medium mb-1">我们注意到你提到了自伤相关的念头</p>
          <p className="text-ink-soft">
            这不是小事，请尽快联系专业的人：全国心理援助热线 12356，或前往医院精神科 / 心理科就诊。
          </p>
        </div>
      )}

      <p className="text-xs text-ink-soft mb-6">{result.disclaimer}</p>
      <button onClick={onRetake} className="px-5 py-2 rounded-lg border border-line text-sm hover:border-tide">
        再测一次
      </button>
    </div>
  );
}
