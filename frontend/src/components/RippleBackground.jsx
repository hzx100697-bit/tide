import React from 'react';

// 页面的视觉签名：三层同心圆以不同延迟向外扩散，呼应"潮汐"与"呼吸"的意象
export default function RippleBackground({ className = '' }) {
  return (
    <div className={`relative pointer-events-none ${className}`} aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute w-40 h-40 rounded-full border border-tide/30 animate-ripple"
            style={{ animationDelay: `${i * 1.1}s` }}
          />
        ))}
        <span className="absolute w-24 h-24 rounded-full bg-tide/10" />
        <span className="absolute w-10 h-10 rounded-full bg-tide/25" />
      </div>
    </div>
  );
}
