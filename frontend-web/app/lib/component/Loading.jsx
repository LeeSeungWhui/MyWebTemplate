/**
 * 파일명: Loading.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Loading UI 컴포넌트 구현
 */
import Icon from './Icon';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70 backdrop-blur-sm">
            <div className="bg-white/50 px-8 py-7 rounded-lg flex flex-col items-center shadow-lg w-[120px]">
                <Icon
                    icon="ri:RiLoader4Line"
                    size="2.5em"
                    className="animate-spin text-blue-500"
                />
                <span className="mt-3 text-sm font-medium text-gray-600">
                    처리중...
                </span>
            </div>
        </div>
    );
};

export default Loading; 