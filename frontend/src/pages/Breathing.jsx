import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const TECHNIQUES = {
  '4-7-8': { label: '4-7-8 放松呼吸法', desc: '快速平静神经系统，适合入睡前', phases: [
    { name: 'inhale', label: '吸气', seconds: 4 },
    { name: 'hold', label: '屏息', seconds: 7 },
    { name: 'exhale', label: '呼气', seconds: 8 }
  ]},
  box: { label: '箱式呼吸法', desc: '军队和运动员常用，提升专注力', phases: [
    { name: 'inhale', label: '吸气', seconds: 4 },
    { name: 'hold', label: '屏息', seconds: 4 },
    { name: 'exhale', label: '呼气', seconds: 4 },
    { name: 'hold2', label: '屏息', seconds: 4 }
  ]},
  coherent: { label: '共振呼吸法', desc: '平稳心率变异性，日常练习首选', phases: [
    { name: 'inhale', label: '吸气', seconds: 5 },
    { name: 'exhale', label: '呼气', seconds: 5 }
  ]}
};

export default function Breathing() {
  const [technique, setTechnique] = useState('4-7-8');
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TECHNIQUES['4-7-8'].phases[0].seconds);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const current = TECHNIQUES[technique];
  const phase = current.phases[phaseIndex];

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhaseIndex((idx) => (idx + 1) % current.phases.length);
          const nextPhase = current.phases[(phaseIndex + 1) % current.phases.length];
          return nextPhase.seconds;
        }
        return s - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex, technique]);

  function handleStart() {
    setPhaseIndex(0);
    setSecondsLeft(current.phases[0].seconds);
    setElapsed(0);
    setRunning(true);
  }

  async function handleStop() {
    setRunning(false);
    clearInterval(timerRef.current);
    if (elapsed > 3) {
      await api.completeBreathing(technique, elapsed);
    }
  }

  const scale = phase?.name === 'inhale' ? 1.3 : phase?.name === 'exhale' ? 0.75 : 1.1;

  return (
    <div className="h-full overflow-y-auto px-10 py-8 flex flex-col items-center">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="font-display text-2xl mb-1">呼吸练习</h1>
        <p className="text-sm text-ink-soft">跟随圆圈的节奏，慢慢呼吸</p>
      </div>

      {!running && (
        <div className="w-full max-w-md grid grid-cols-1 gap-3 mb-10">
          {Object.entries(TECHNIQUES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTechnique(key)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                technique === key ? 'border-tide bg-tide/5' : 'border-line hover:border-tide'
              }`}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-ink-soft">{t.desc}</p>
            </button>
          ))}
        </div>
      )}

      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        <div
          className="absolute w-40 h-40 rounded-full bg-tide/10 transition-transform ease-in-out"
          style={{ transform: `scale(${scale})`, transitionDuration: running ? `${phase.seconds}s` : '0.6s' }}
        />
        <div
          className="absolute w-28 h-28 rounded-full bg-tide/20 transition-transform ease-in-out"
          style={{ transform: `scale(${scale})`, transitionDuration: running ? `${phase.seconds}s` : '0.6s' }}
        />
        <div className="relative z-10 text-center">
          <p className="font-display text-2xl text-tide">{running ? phase.label : '准备好了吗'}</p>
          {running && <p className="text-sm text-ink-soft mt-1">{secondsLeft}s</p>}
        </div>
      </div>

      {running ? (
        <button
          onClick={handleStop}
          className="px-6 py-3 rounded-full border border-line text-sm hover:border-crisis hover:text-crisis"
        >
          结束练习
        </button>
      ) : (
        <button
          onClick={handleStart}
          className="px-6 py-3 rounded-full bg-tide text-white text-sm hover:bg-tide-deep"
        >
          开始练习
        </button>
      )}

      {running && <p className="text-xs text-ink-soft mt-4">已练习 {elapsed} 秒</p>}
    </div>
  );
}
