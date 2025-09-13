/**
 * 파일명: Skeleton.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Skeleton UI 컴포넌트 구현
 */
const Skeleton = ({ className = '', variant = 'rect', lines = 1, circleSize = 40, ...props }) => {
  const base = 'bg-gray-200/70 animate-pulse';
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`.trim()} {...props}>
        {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
          <div key={i} className={`${base} h-3 w-full rounded`}></div>
        ))}
      </div>
    );
  }
  if (variant === 'circle') {
    return <div className={`${base} rounded-full`} style={{ width: circleSize, height: circleSize }} {...props}></div>;
  }
  return <div className={`${base} rounded ${className}`} {...props}></div>;
};

export default Skeleton;

