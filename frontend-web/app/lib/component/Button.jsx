/**
 * 파일명: Button.jsx
 * 작성자: LSH
 * 갱신일: 2026-06-30
 * 설명: Button UI 컴포넌트 구현
 */
import { forwardRef, useId } from 'react';
import Icon from './Icon';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
const Button = forwardRef(({
    children,
    type = 'button',
    className = '',
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    status,
    'aria-describedby': ariaDescribedByProp,
    ...props
}, ref) => {

    const buttonVariantMapObj = {
        primary: "bg-indigo-600 text-white shadow-indigo-600/20 ring-indigo-500/20 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-600/20 focus-visible:ring-indigo-500/30",
        secondary: "bg-slate-100 text-slate-900 shadow-slate-900/5 ring-slate-900/10 hover:bg-slate-200/75 hover:shadow-md hover:shadow-slate-900/10 focus-visible:ring-slate-500/30",
        outline: "bg-white text-slate-700 shadow-slate-900/5 ring-slate-200 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md hover:shadow-slate-900/10 focus-visible:ring-indigo-500/25",
        danger: "bg-rose-600 text-white shadow-rose-600/20 ring-rose-500/20 hover:bg-rose-500 hover:shadow-md hover:shadow-rose-600/20 focus-visible:ring-rose-500/30",
        success: "bg-emerald-600 text-white shadow-emerald-600/20 ring-emerald-500/20 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-600/20 focus-visible:ring-emerald-500/30",
        warning: "bg-amber-500 text-white shadow-amber-600/20 ring-amber-500/20 hover:bg-amber-400 hover:shadow-md hover:shadow-amber-600/20 focus-visible:ring-amber-500/30",
        ghost: "bg-transparent text-slate-600 shadow-none ring-transparent hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-500/25 active:shadow-none",
        link: "bg-transparent text-indigo-700 shadow-none ring-transparent underline-offset-4 hover:text-indigo-900 hover:underline focus-visible:ring-indigo-500/25 active:translate-y-0 active:shadow-none",
        dark: "bg-slate-950 text-slate-50 shadow-slate-950/25 ring-white/10 hover:bg-slate-800 hover:shadow-md hover:shadow-slate-950/25 focus-visible:ring-slate-500/30",
    };

    const buttonSizeClassMap = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
    };

    const iconSize = {
        sm: '1em',
        md: '1.1em',
        lg: '1.2em'
    }[size];

    const iconSpacing = {
        sm: 'mr-1.5',
        md: 'mr-2',
        lg: 'mr-2.5'
    }[size];

    const isBusy = loading || status === 'loading';
    const busyStatusId = useId();
    const buttonAriaDescribedBy = [
        ariaDescribedByProp,
        isBusy ? busyStatusId : null,
    ].filter(Boolean).join(' ') || undefined;
    let leadingIconNode = null;
    if (isBusy) {
        leadingIconNode = (
            <Icon icon="ri:RiLoader4Line" className="animate-spin mr-2" size={iconSize} />
        );
    } else if (icon && iconPosition === 'left') {
        leadingIconNode = (
            <Icon icon={icon} className={iconSpacing} size={iconSize} />
        );
    }
    return (
        <>
            <button
                ref={ref}
                type={type}
                disabled={disabled || isBusy}
                className={`
                    inline-flex items-center justify-center rounded-lg font-semibold shadow-sm ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px active:shadow-none disabled:active:translate-y-0 disabled:active:shadow-sm
                    ${buttonVariantMapObj[variant]}
                    ${buttonSizeClassMap[size]}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${className}
                `.trim()}
                aria-busy={isBusy ? 'true' : undefined}
                aria-describedby={buttonAriaDescribedBy}
                {...props}
            >
                {leadingIconNode}
                {children}
                {!isBusy && icon && iconPosition === 'right' && (
                    <Icon icon={icon} className={`ml-${iconSpacing.slice(3)}`} size={iconSize} />
                )}
            </button>
            {isBusy ? (
                <span id={busyStatusId} className="sr-only" role="status" aria-live="polite">
                    {COMMON_COMPONENT_LANG_KO.loading.processingText}
                </span>
            ) : null}
        </>
    );
});

Button.displayName = 'Button';

export default Button;
