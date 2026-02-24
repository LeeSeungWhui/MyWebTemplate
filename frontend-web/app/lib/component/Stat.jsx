/**
 * 파일명: Stat.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Stat UI 컴포넌트 구현
 */
/**
 * 파일명: Stat.jsx
 * 설명: 간단 KPI 지표 카드
 */
import React from 'react';

const Stat = ({
  label,
  value,
  delta,
  deltaType = 'neutral', // 'up' | 'down' | 'neutral'
  icon, // optional ReactNode
  helpText,
  className = '',
}) => {
  let deltaColor = 'text-gray-500';
  let deltaPrefix = '';
  if (deltaType === 'up') {
    deltaColor = 'text-green-600';
    deltaPrefix = '▲ ';
  } else if (deltaType === 'down') {
    deltaColor = 'text-red-600';
    deltaPrefix = '▼ ';
  }
  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{label}</div>
        {icon ? <div aria-hidden>{icon}</div> : null}
      </div>
      <div className="mt-1 flex items-end gap-2">
        <div className="text-2xl font-bold" aria-label="값">{value}</div>
        {delta != null && (
          <div className={`${deltaColor} text-sm`} aria-label="증감">{deltaPrefix}{delta}</div>
        )}
      </div>
      {helpText && <div className="mt-1 text-xs text-gray-500">{helpText}</div>}
    </div>
  );
};

export default Stat;
