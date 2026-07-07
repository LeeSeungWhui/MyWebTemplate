/**
 * 파일명: Badge.jsx
 * 작성자: LSH
 * 갱신일: 2026-06-30
 * 설명: Badge UI 컴포넌트 구현
 */
const badgeVariantClassMap = {
  neutral: 'border-transparent bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  primary: 'border-transparent bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/80',
  success: 'border-transparent bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80',
  warning: 'border-transparent bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80',
  danger: 'border-transparent bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/80',
  outline: 'border-slate-200 bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-900/5',
};

const badgeSizeClassMap = {
  sm: 'h-5 px-2 text-xs leading-5',
  md: 'h-6 px-2.5 text-sm leading-6',
};

/**
 * @description variant/size/pill 조합으로 뱃지 스타일을 계산해 텍스트 라벨을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const Badge = ({ children, variant = 'neutral', size = 'sm', pill = false, className = '', ...props }) => {

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap border font-semibold ${pill ? 'rounded-full' : 'rounded-md'} ${badgeVariantClassMap[variant] || badgeVariantClassMap.neutral} ${badgeSizeClassMap[size] || badgeSizeClassMap.sm} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
