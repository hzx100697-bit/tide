import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api.js';
import RippleBackground from '../components/RippleBackground.jsx';

export default function Dashboard() {
  const [trend, setTrend] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [breathingStats, setBreathingStats] = useState({ totalSessions: 0, totalSeconds: 0 });
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    api.journalTrend(14).then(setTrend).catch(() => {});
    api.assessmentHistory().then(setAssessments).catch(() => {});
    api.breathingStats().then(setBreathingStats).catch(() => {});
    api.listJournal().then((d) => setJournalCount(d.length)).catch(() => {});
  }, []);

  const latestAssessment = assessments[assessments.length - 1];

  return (
    <div className="h-full overflow-y-auto">
      <section className="relative border-b border-line overflow-hidden">
        <RippleBackground className="absolute right-0 top-0 w-72 h-full" />
        <div className="relative px-10 py-14 max-w-2xl">
          <p className="text-sm text-tide font-medium mb-2">欢迎回来</p>
          <h1 className="font-display text-4xl leading-tight mb-4">
            今天的情绪，
            <br />
            也值得被认真记录
          </h1>
          <p className="text-ink-soft text-sm leading-relaxed">
            潮汐是一个 AI 情绪陪伴作品集项目，包含对话陪伴、情绪日记、标准化心理测评与呼吸练习四个模块，
            数据全部保存在本地数据库中，仅供你个人体验与展示使用。
          </p>
        </div>
      </section>

      <section className="px-10 py-8 grid grid-cols-4 gap-4">
        <StatCard label="日记记录" value={journalCount} unit="条" icon="ti-notebook" />
        <StatCard
          label="最近 PHQ-9"
          value={latestAssessment ? latestAssessment.score : '—'}
          unit={latestAssessment ? latestAssessment.severity : ''}
          icon="ti-clipboard-check"
        />
        <StatCard label="呼吸练习" value={breathingStats.totalSessions} unit="次" icon="ti-wind" />
        <StatCard
          label="练习时长"
          value={Math.round(breathingStats.totalSeconds / 60)}
          unit="分钟"
          icon="ti-clock"
        />
      </section>

      <section className="px-10 pb-10">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">近 14 天情绪趋势</h2>
            <Link to="/journal" className="text-sm text-tide hover:underline">
              去记录 →
            </Link>
          </div>
          {trend.length === 0 ? (
            <EmptyState
              text="还没有情绪记录，去写下第一条日记吧"
              actionLabel="开始记录"
              to="/journal"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D3DEDB" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4E6367' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#4E6367' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #D3DEDB', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgMood"
                  stroke="#1F6F72"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#1F6F72' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="px-10 pb-14 grid grid-cols-3 gap-4">
        <QuickLink
          to="/chat"
          title="找 AI 聊聊"
          desc="不加评判地倾听，随时可以开始"
          icon="ti-message-circle"
        />
        <QuickLink to="/assessment" title="做一次自我评估" desc="标准化 PHQ-9 情绪量表" icon="ti-clipboard-check" />
        <QuickLink to="/breathing" title="做一次呼吸练习" desc="3 种科学呼吸法，5 分钟见效" icon="ti-wind" />
      </section>
    </div>
  );
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 text-ink-soft text-xs mb-3">
        <i className={`ti ${icon}`} aria-hidden="true" />
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl">{value}</span>
        <span className="text-xs text-ink-soft">{unit}</span>
      </div>
    </div>
  );
}

function QuickLink({ to, title, desc, icon }) {
  return (
    <Link
      to={to}
      className="bg-surface border border-line rounded-2xl p-5 hover:border-tide transition-colors group"
    >
      <i className={`ti ${icon} text-xl text-tide mb-3 block`} aria-hidden="true" />
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-ink-soft">{desc}</p>
    </Link>
  );
}

export function EmptyState({ text, actionLabel, to }) {
  return (
    <div className="text-center py-10">
      <p className="text-sm text-ink-soft mb-3">{text}</p>
      {to && (
        <Link to={to} className="text-sm text-tide hover:underline">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
