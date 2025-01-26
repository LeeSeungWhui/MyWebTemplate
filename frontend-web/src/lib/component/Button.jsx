const Button = ({
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    children,
    ...props
}) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
        secondary: "bg-primary-100 text-primary-500 hover:bg-primary-200 focus:ring-primary-500",
        success: "bg-success-500 text-white hover:bg-success-600 focus:ring-success-500",
        warning: "bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500",
        danger: "bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-primary-500",
        link: "text-primary-500 hover:text-primary-600 hover:underline focus:ring-primary-500",
        dark: "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800",
        none: ""
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={`
                ${baseStyle}
                ${variants[variant] || ""}
                ${sizes[size] || sizes.md}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `.trim()}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;