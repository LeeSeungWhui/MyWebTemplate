import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '../../common/util/cn';

const Button = ({
    children,
    variant = 'primary',    // primary, secondary, outline, ghost, danger, success
    size = 'md',           // sm, md, lg
    disabled = false,
    loading = false,
    onPress,
    className,
    ...props
}) => {
    // 기본 스타일
    const baseStyle = "items-center justify-center rounded-md";

    // 사이즈별 스타일
    const sizeStyles = {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-6 py-3"
    };

    // 버튼 종류별 스타일
    const variantStyles = {
        primary: "bg-primary-500 active:bg-primary-600",
        secondary: "bg-gray-500 active:bg-gray-600",
        outline: "border border-primary-500 active:bg-primary-50",
        ghost: "active:bg-gray-100",
        danger: "bg-danger-500 active:bg-danger-600",
        success: "bg-success-500 active:bg-success-600"
    };

    // 텍스트 색상
    const textStyles = {
        primary: "text-white",
        secondary: "text-white",
        outline: "text-primary-500",
        ghost: "text-gray-700",
        danger: "text-white",
        success: "text-white"
    };

    // 사이즈별 텍스트 스타일
    const textSizeStyles = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    // disabled 스타일
    const disabledStyle = disabled ? "opacity-50" : "";

    return (
        <TouchableOpacity
            onPress={!disabled && !loading ? onPress : undefined}
            className={cn(
                baseStyle,
                sizeStyles[size],
                variantStyles[variant],
                disabledStyle,
                className
            )}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : 'white'}
                    size="small"
                />
            ) : (
                <Text className={cn(
                    "font-semibold",
                    textStyles[variant],
                    textSizeStyles[size]
                )}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button; 