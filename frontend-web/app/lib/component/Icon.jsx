/**
 * 파일명: Icon.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Icon UI 컴포넌트 구현
 */
import { forwardRef } from 'react';
import * as AiIcons from 'react-icons/ai';  // 한글설명: Ant Design Icons
import * as BiIcons from 'react-icons/bi';  // Boxicons
import * as BsIcons from 'react-icons/bs';  // 한글설명: Bootstrap Icons
import * as FiIcons from 'react-icons/fi';  // 한글설명: Feather Icons
import * as HiIcons from 'react-icons/hi';  // Heroicons
import * as IoIcons from 'react-icons/io5'; // Ionicons 5
import * as MdIcons from 'react-icons/md';  // 한글설명: Material Design Icons
import * as RiIcons from 'react-icons/ri';  // 한글설명: Remix Icons

const iconSets = {
    ai: AiIcons,
    bi: BiIcons,
    bs: BsIcons,
    fi: FiIcons,
    hi: HiIcons,
    io: IoIcons,
    md: MdIcons,
    ri: RiIcons,
};

const Icon = forwardRef(({
    icon,
    size = "1em",
    className = "",
    color,
    ariaLabel,
    decorative = true,
    ...props
}, ref) => {
    // icon 형식: "md:Home" 또는 "MdHome" 형식 지원
    const [prefix, name] = icon.includes(':') ? icon.split(':') : [icon.substring(0, 2).toLowerCase(), icon];
    if (!iconSets[prefix]) {
        console.warn(`Icon set "${prefix}" not found`);
        return null;
    }

    // 아이콘 이름으로 컴포넌트 찾기
    const IconComponent =
      iconSets[prefix][name] || iconSets[prefix][`${prefix.toUpperCase()}${name}`];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in set "${prefix}"`);
        return null;
    }

    const a11y = decorative && !ariaLabel
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': ariaLabel };

    return (
        <IconComponent
            ref={ref}
            size={size}
            className={className}
            color={color}
            {...a11y}
            {...props}
        />
    );
});

Icon.displayName = 'Icon';

/**
 * @description Icon export를 노출한다.
 */
export default Icon; 
