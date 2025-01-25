import * as AiIcons from 'react-icons/ai';  // Ant Design Icons
import * as BiIcons from 'react-icons/bi';  // Boxicons
import * as BsIcons from 'react-icons/bs';  // Bootstrap Icons
import * as FiIcons from 'react-icons/fi';  // Feather Icons
import * as HiIcons from 'react-icons/hi';  // Heroicons
import * as IoIcons from 'react-icons/io5'; // Ionicons 5
import * as MdIcons from 'react-icons/md';  // Material Design Icons
import * as RiIcons from 'react-icons/ri';  // Remix Icons

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

const Icon = ({
    icon,
    size = "1em",
    className = "",
    color,
    ...props
}) => {
    // icon 형식: "md:Home" 또는 "MdHome" 형식 지원
    const [prefix, name] = icon.includes(':') ? icon.split(':') : [icon.substring(0, 2).toLowerCase(), icon];
    const IconSet = iconSets[prefix];

    if (!IconSet) {
        console.warn(`Icon set "${prefix}" not found`);
        return null;
    }

    // 아이콘 이름으로 컴포넌트 찾기
    const IconComponent = IconSet[name] || IconSet[`${prefix.toUpperCase()}${name}`];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in set "${prefix}"`);
        return null;
    }

    return (
        <IconComponent
            size={size}
            className={className}
            color={color}
            {...props}
        />
    );
};

export default Icon; 