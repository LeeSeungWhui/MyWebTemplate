/**
 * 파일명: lib/component/Button.jsx
 * 설명: 상태/아이콘/로딩을 지원하는 공통 버튼 컴포넌트
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../common/util/cn';
import Icon from './Icon';

/**
 * @description 기본 버튼 컴포넌트. variant/size/icon/로딩 상태를 지원한다.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  status,
  onPress,
  className,
  ...props
}) => {
  const baseStyle = 'flex-row items-center justify-center rounded-md';

  const sizeStyles = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'border border-primary-500 bg-white active:bg-primary-50',
    outline: 'border border-gray-300 bg-white active:bg-gray-50',
    danger: 'bg-danger-500 active:bg-danger-600',
    success: 'bg-success-500 active:bg-success-600',
    warning: 'bg-warning-500 active:bg-warning-600',
    ghost: 'bg-transparent active:bg-gray-100',
    link: 'bg-transparent',
    dark: 'bg-gray-900 active:bg-black',
  };

  const textColorStyles = {
    primary: 'text-white',
    secondary: 'text-primary-500',
    outline: 'text-gray-700',
    danger: 'text-white',
    success: 'text-white',
    warning: 'text-white',
    ghost: 'text-gray-700',
    link: 'text-primary-500',
    dark: 'text-white',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizeMap = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const iconSpacingLeft = {
    sm: 'mr-1.5',
    md: 'mr-2',
    lg: 'mr-2.5',
  };

  const iconSpacingRight = {
    sm: 'ml-1.5',
    md: 'ml-2',
    lg: 'ml-2.5',
  };

  const isBusy = loading || status === 'loading';
  const isDisabled = disabled || isBusy;
  const disabledStyle = isDisabled ? 'opacity-50' : '';

  const handlePress = isDisabled ? undefined : onPress;

  const indicatorColor =
    variant === 'outline' || variant === 'ghost' || variant === 'secondary' || variant === 'link'
      ? '#2563EB'
      : '#FFFFFF';

  const label = (
    <Text
      className={cn(
        'font-medium',
        textColorStyles[variant] || textColorStyles.primary,
        textSizeStyles[size] || textSizeStyles.md,
      )}
    >
      {children}
    </Text>
  );

  const renderLeftIcon = () => {
    if (!icon || iconPosition !== 'left' || isBusy) {
      return null;
    }

    return (
      <View className={iconSpacingLeft[size] || iconSpacingLeft.md}>
        <Icon icon={icon} size={iconSizeMap[size] || iconSizeMap.md} color={indicatorColor} />
      </View>
    );
  };

  const renderRightIcon = () => {
    if (!icon || iconPosition !== 'right' || isBusy) {
      return null;
    }

    return (
      <View className={iconSpacingRight[size] || iconSpacingRight.md}>
        <Icon icon={icon} size={iconSizeMap[size] || iconSizeMap.md} color={indicatorColor} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={cn(
        baseStyle,
        sizeStyles[size],
        variantStyles[variant] || variantStyles.primary,
        disabledStyle,
        className,
      )}
      {...props}
    >
      {isBusy ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <>
          {renderLeftIcon()}
          {label}
          {renderRightIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
