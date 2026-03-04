/**
 * 파일명: Skeleton.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: Skeleton UI 컴포넌트 구현
 */

const Skeleton = ({ className = '', variant = 'rect', lines = 1, circleSize = 40, ...props }) => {

  const base = 'bg-gray-200/70 animate-pulse';

  /**
   * @description circle variant의 숫자 size를 Tailwind width/height 클래스로 변환
   * 반환값: 지원되는 크기 클래스 문자열.
   * @updated 2026-03-04
   */
  const resolveCircleSizeClass = (size) => {
    const sizeMap = {
      16: 'w-4 h-4',
      20: 'w-5 h-5',
      24: 'w-6 h-6',
      32: 'w-8 h-8',
      40: 'w-10 h-10',
      48: 'w-12 h-12',
      56: 'w-14 h-14',
      64: 'w-16 h-16',
    };
    const normalized = Number(size);
    if (Number.isFinite(normalized) && sizeMap[normalized]) return sizeMap[normalized];
    return sizeMap[40];
  };

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`.trim()} {...props}>
        {Array.from({ length: Math.max(1, lines) }).map((_line, i) => (
          <div key={i} className={`${base} h-3 w-full rounded`}></div>
        ))}
      </div>
    );
  }
  if (variant === 'circle') {
    return <div className={`${base} rounded-full ${resolveCircleSizeClass(circleSize)}`} {...props}></div>;
  }
  return <div className={`${base} rounded ${className}`} {...props}></div>;
};

export default Skeleton;
