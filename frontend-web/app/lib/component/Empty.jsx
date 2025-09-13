/**
 * 파일명: Empty.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Empty UI 컴포넌트 구현
 */
import Icon from './Icon';

const Empty = ({
  icon = 'md:MdInbox',
  title = '데이터가 없습니다',
  description,
  className = '',
  children,
  action,
  ...props
}) => {
  return (
    <div className={`text-center p-8 border border-dashed border-gray-200 rounded-lg bg-white ${className}`.trim()} {...props}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
        <Icon icon={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default Empty;

