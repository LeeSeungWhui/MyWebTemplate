/**
 * 파일명: Tooltip.jsx
 * 설명: hover/click 트리거에 반응하는 간단 툴팁
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { cn } from "../../common/util/cn";

const placements = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const Tooltip = forwardRef(
  (
    {
      content,
      placement = "top",
      delay = 150,
      disabled = false,
      trigger = "hover",
      className = "",
      children,
      textDirection = "lr",
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    const timer = useRef(null);

    const clearTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };

    const show = () => {
      if (disabled) return;
      clearTimer();
      timer.current = setTimeout(() => setOpen(true), delay);
    };

    const hide = () => {
      clearTimer();
      setOpen(false);
    };

    useEffect(() => () => clearTimer(), []);

    const toggle = () => {
      if (disabled) return;
      setOpen((prev) => !prev);
    };

    const isHover = trigger === "hover";
    const isClick = trigger === "click";

    const hoverProps = isHover
      ? {
          onHoverIn: show,
          onHoverOut: hide,
          // 모바일에서는 hover가 없으므로 press로 대체
          onPressIn: Platform.OS !== "web" ? show : undefined,
          onPressOut: Platform.OS !== "web" ? hide : undefined,
        }
      : {};

    return (
      <View className={cn("relative", className)}>
        <Pressable
          ref={ref}
          accessibilityRole="button"
          onFocus={show}
          onBlur={hide}
          onPress={isClick ? toggle : undefined}
          {...hoverProps}
        >
          {children}
        </Pressable>

        {open && content ? (
          <View
            pointerEvents="none"
            accessible
            accessibilityLabel={content}
            style={
              textDirection === "tb"
                ? { transform: [{ rotate: "-90deg" }] }
                : undefined
            }
            className={cn(
              "absolute z-40 rounded-md bg-gray-900 px-2 py-1 shadow",
              "max-w-xs",
              placements[placement] || placements.top,
            )}
            nativeID={open ? id : undefined}
          >
            <Text className="text-xs text-white">{content}</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

Tooltip.displayName = "Tooltip";

export default Tooltip;
