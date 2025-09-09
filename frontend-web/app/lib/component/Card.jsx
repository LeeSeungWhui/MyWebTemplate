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
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`.trim()}
      aria-labelledby={headingId}
      {...props}
    >
      {(title || actions || subtitle) && (
        <header className={`flex items-start justify-between gap-4 border-b border-gray-200 p-4 ${headerClassName}`.trim()}>
          <div>
            {title && (
              <h3 id={headingId} className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="shrink-0">{actions}</div>
          )}
        </header>
      )}
      <div className={`p-4 ${bodyClassName}`.trim()}>
        {children}
      </div>
      {footer && (
        <footer className={`border-t border-gray-200 p-3 text-sm text-gray-600 ${footerClassName}`.trim()}>
          {footer}
        </footer>
      )}
    </section>
  );
};

export default Card;

