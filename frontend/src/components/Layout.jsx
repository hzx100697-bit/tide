import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApiKey } from '../ApiKeyContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: '概览', icon: 'ti-home' },
  { to: '/chat', label: 'AI 陪伴', icon: 'ti-message-circle' },
  { to: '/journal', label: '情绪日记', icon: 'ti-notebook' },
  { to: '/assessment', label: '心理测评', icon: 'ti-clipboard-check' },
  { to: '/breathing', label: '呼吸练习', icon: 'ti-wind' }
];

export default function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { apiKey, setApiKey } = useApiKey();
  const [draftKey, setDraftKey] = useState(apiKey);

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/iconfont/tabler-icons.min.css"
      />

      <aside className="w-60 shrink-0 border-r border-line bg-surface flex flex-col">
        <div className="px-6 py-7">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-tide/10 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-tide animate-breathe" />
            </span>
            <span className="font-display text-xl tracking-tight">潮汐 Tide</span>
          </div>
          <p className="text-xs text-ink-soft mt-1 pl-10">AI 情绪陪伴</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-tide text-white' : 'text-ink-soft hover:bg-surface-alt'
                }`
              }
            >
              <i className={`ti ${item.icon} text-base`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <button
            onClick={() => {
              setDraftKey(apiKey);
              setSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-soft hover:bg-surface-alt transition-colors"
          >
            <i className="ti ti-settings text-base" aria-hidden="true" />
            设置 API Key
            {apiKey ? (
              <span className="ml-auto w-2 h-2 rounded-full bg-tide" title="已配置" />
            ) : (
              <span className="ml-auto w-2 h-2 rounded-full bg-crisis" title="未配置" />
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {settingsOpen && (
        <div
          className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg mb-1">Anthropic API Key</h2>
            <p className="text-sm text-ink-soft mb-4">
              用于驱动 AI 陪伴对话，Key 仅保存在你浏览器的本地存储中，不会上传到除 Anthropic 官方接口以外的任何地方。
            </p>
            <input
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-4 focus:border-tide outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 text-sm rounded-lg text-ink-soft hover:bg-surface-alt"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setApiKey(draftKey.trim());
                  setSettingsOpen(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-tide text-white hover:bg-tide-deep"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
