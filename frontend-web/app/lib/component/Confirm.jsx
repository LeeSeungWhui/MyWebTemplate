/**
 * 파일명: Confirm.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Confirm UI 컴포넌트 구현
 */
import Icon from './Icon';
import Button from './Button';

const Confirm = ({
    title = '확인',
    text,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소'
}) => {
    const displayText = typeof text === 'string' ? text.replaceAll('\\n', '\n') : text;
    const styles = {
        info: {
            icon: 'ri:RiQuestionLine',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        warning: {
            icon: 'ri:RiErrorWarningLine',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        danger: {
            icon: 'ri:RiAlertLine',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    };

    const currentStyle = styles[type];

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
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="min-w-[80px]"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="min-w-[80px]"
                            variant={type === 'danger' ? 'danger' : 'primary'}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Confirm; 
