/**
 * 파일명: Card.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-02
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

  const headingId = id && title ? `${id}-title` : undefined;
  const hasHeader = Boolean(title || actions || subtitle);
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 ${className}`.trim()}
      aria-labelledby={headingId}
      {...props}
    >
      {hasHeader && (
        <div className={`flex flex-col gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`.trim()}>
          <div>
            {title && (
              <h3 id={headingId} className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="w-full sm:w-auto sm:shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={`${hasHeader ? 'px-6 pb-6 pt-2' : 'p-6'} min-w-0 w-full text-slate-700 ${bodyClassName}`.trim()}>
        {children}
      </div>
      {footer && (
        <div className={`border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-sm text-slate-500 ${footerClassName}`.trim()}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
