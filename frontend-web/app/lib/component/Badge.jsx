/**
 * 파일명: Badge.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Badge UI 컴포넌트 구현
 */
const variants = {
  neutral: 'bg-gray-100 text-gray-800 border-transparent',
  primary: 'bg-blue-100 text-blue-800 border-transparent',
  success: 'bg-green-100 text-green-800 border-transparent',
  warning: 'bg-yellow-100 text-yellow-900 border-transparent',
  danger: 'bg-red-100 text-red-800 border-transparent',
  outline: 'bg-transparent text-gray-800 border-gray-300',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
};

/**
 * @description variant/size/pill 조합으로 뱃지 스타일을 계산해 텍스트 라벨을 렌더링한다.
 * @returns {JSX.Element}
 */
const Badge = ({ children, variant = 'neutral', size = 'sm', pill = false, className = '', ...props }) => {

  const base = 'inline-flex items-center border font-medium';
  const radius = pill ? 'rounded-full' : 'rounded-md';
  const cls = `${base} ${radius} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`.trim();
  return (
    <span className={cls} {...props}>{children}</span>
  );
};

export default Badge;
