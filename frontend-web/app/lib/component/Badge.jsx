/**
 * 파일명: Badge.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Badge UI 컴포넌트 구현
 */
const badgeVariantClassMap = {
  neutral: 'bg-zinc-100/80 text-zinc-700 ring-1 ring-zinc-200/50 border-transparent',
  primary: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 border-transparent',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 border-transparent',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/60 border-transparent',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60 border-transparent',
  outline: 'bg-transparent text-zinc-700 border-zinc-200/80',
};

const badgeSizeClassMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
};

/**
 * @description variant/size/pill 조합으로 뱃지 스타일을 계산해 텍스트 라벨을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const Badge = ({ children, variant = 'neutral', size = 'sm', pill = false, className = '', ...props }) => {

  return (
    <span
      className={`inline-flex items-center border font-medium ${pill ? 'rounded-full' : 'rounded-lg'} ${badgeVariantClassMap[variant] || badgeVariantClassMap.neutral} ${badgeSizeClassMap[size] || badgeSizeClassMap.sm} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
