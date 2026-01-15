/**
 * 파일명: lib/component/Icon.jsx
 * 설명: 여러 벡터 아이콘 세트를 prefix 기반으로 렌더링하는 아이콘 컴포넌트
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { forwardRef } from 'react';
import {
    AntDesign,        // ai
    Feather,          // fi
    FontAwesome,      // fa
    Ionicons,         // io
    MaterialIcons,    // md
    MaterialCommunityIcons,  // mc
    Octicons,         // oc
    SimpleLineIcons   // si
} from '@expo/vector-icons';

const iconSets = {
    ai: AntDesign,
    fi: Feather,
    fa: FontAwesome,
    io: Ionicons,
    md: MaterialIcons,
    mc: MaterialCommunityIcons,
    oc: Octicons,
    si: SimpleLineIcons
};

const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
};

/**
 * @description prefix:name 형태로 세트를 선택해 렌더링하는 아이콘 컴포넌트.
 */
const Icon = forwardRef(({
    icon,
    size = 'md',
    color = 'black',
    style,
    ...props
}, ref) => {
    // icon 형식: "md:home" 또는 "io:bookmark" 형식
    const [prefix, name] = icon.includes(':') ? icon.split(':') : ['md', icon];
    const IconSet = iconSets[prefix];

    if (!IconSet) {
        console.warn(`Icon set "${prefix}" not found`);
        return null;
    }

    return (
        <IconSet
            ref={ref}
            name={name}
            size={typeof size === 'string' ? iconSizeMap[size] : size}
            color={color}
            style={style}
            {...props}
        />
    );
});

Icon.displayName = 'Icon';

export default Icon; 
