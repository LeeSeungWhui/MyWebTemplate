/**
 * 파일명: Button.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
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
        primary: "bg-indigo-600 text-white shadow-indigo-500/20 ring-1 ring-inset ring-white/15 hover:bg-indigo-500 focus-visible:ring-indigo-500/50",

        secondary: "border border-zinc-200 text-zinc-900 bg-zinc-100 shadow-zinc-900/5 hover:bg-zinc-200/80 focus-visible:ring-zinc-950",
        outline: "border border-zinc-200 text-zinc-700 bg-white shadow-zinc-900/5 hover:bg-zinc-50 focus-visible:ring-zinc-950",
        danger: "bg-red-600 text-white shadow-red-900/20 ring-1 ring-inset ring-white/10 hover:bg-red-700 focus-visible:ring-red-500",
        success: "bg-green-600 text-white shadow-green-900/20 ring-1 ring-inset ring-white/10 hover:bg-green-700 focus-visible:ring-green-500",
        warning: "bg-yellow-600 text-white shadow-yellow-900/20 ring-1 ring-inset ring-white/10 hover:bg-yellow-700 focus-visible:ring-yellow-500",
        ghost: "text-zinc-600 bg-transparent shadow-none hover:bg-zinc-100 focus-visible:ring-zinc-500 active:shadow-none",
        link: "text-zinc-900 bg-transparent shadow-none hover:text-zinc-700 underline-offset-2 hover:underline focus-visible:ring-zinc-950 active:shadow-none active:translate-y-0",
        dark: "bg-zinc-950 text-zinc-50 shadow-zinc-950/30 ring-1 ring-inset ring-white/10 hover:bg-black focus-visible:ring-zinc-950",
    };

    const buttonSizeClassMap = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
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
                    inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-[color,background-color,box-shadow,transform] active:translate-y-px active:shadow-none disabled:active:translate-y-0 disabled:active:shadow-sm
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
