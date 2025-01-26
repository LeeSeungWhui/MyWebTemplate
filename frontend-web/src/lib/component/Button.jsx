import { forwardRef } from 'react';
import Icon from './Icon';

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
    ...props
}, ref) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
        outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
        ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };

    const buttonClass = `
        ${baseStyle}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
    `.trim();

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

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={buttonClass}
            {...props}
        >
            {loading ? (
                <Icon icon="ri:RiLoader4Line" className="animate-spin mr-2" size={iconSize} />
            ) : icon && iconPosition === 'left' ? (
                <Icon icon={icon} className={iconSpacing} size={iconSize} />
            ) : null}
            {children}
            {!loading && icon && iconPosition === 'right' && (
                <Icon icon={icon} className={`ml-${iconSpacing.slice(3)}`} size={iconSize} />
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;