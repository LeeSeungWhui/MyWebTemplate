/**
 * 파일명: Alert.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Alert UI 컴포넌트 구현
 */
import Icon from './Icon';
import Button from './Button';

const Alert = ({
    title = '알림',  // 제목 (옵션)
    text,           // 필수 메시지
    type = 'info',  // info, success, warning, error
    onClick        // 확인 버튼 클릭 핸들러
}) => {
    // 타입별 스타일 및 아이콘 설정
    const styles = {
        info: {
            icon: 'ri:RiInformationLine',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        success: {
            icon: 'ri:RiCheckboxCircleLine',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        warning: {
            icon: 'ri:RiErrorWarningLine',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        error: {
            icon: 'ri:RiCloseCircleLine',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    };

    const currentStyle = styles[type];
    const displayText = typeof text === 'string' ? text.replaceAll('\\n', '\n') : text;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
            <div className={`
                w-[400px] rounded-lg shadow-lg border ${currentStyle.borderColor}
                ${currentStyle.bgColor} backdrop-blur-sm
                animate-fade-in-up
            `}>
                <div className="p-6">
                    <div className="flex items-start mb-4">
                        <Icon
                            icon={currentStyle.icon}
                            size="1.5em"
                            className={`mr-3 mt-0.5 ${currentStyle.iconColor}`}
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {title}
                            </h3>
                            <p className="text-gray-600 whitespace-pre-line">
                                {displayText}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={onClick}
                            className="min-w-[80px]"
                        >
                            확인
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert; 
