/**
 * 파일명: Card.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Card UI 컴포넌트 구현
 */
const Card = ({
  title,
  subtitle,
  actions,
  children,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  id,
  ...props
}) => {

  const headingId = id ? `${id}-title` : undefined;
  const hasHeader = Boolean(title || actions || subtitle);
  return (
    <div
      className={`rounded-2xl border border-zinc-200/70 bg-white shadow-sm shadow-zinc-900/[0.04] ring-1 ring-zinc-950/[0.03] ${className}`.trim()}
      aria-labelledby={headingId}
      {...props}
    >
      {hasHeader && (
        <div className={`flex flex-col gap-3 p-6 pb-4 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`.trim()}>
          <div>
            {title && (
              <h3 id={headingId} className="text-base font-semibold tracking-tight text-zinc-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="w-full sm:w-auto sm:shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={`${hasHeader ? 'px-6 pb-6 pt-2' : 'p-6'} min-w-0 w-full ${bodyClassName}`.trim()}>
        {children}
      </div>
      {footer && (
        <div className={`px-6 pb-6 pt-2 text-sm text-zinc-600 ${footerClassName}`.trim()}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
