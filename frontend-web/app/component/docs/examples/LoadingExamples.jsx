/**
 * 파일명: LoadingExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Loading 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const LoadingExamples = () => {
    const app = useSharedStore();

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.setLoading(true);
                        setTimeout(() => app.setLoading(false), 2000);
                    }}>
                        전체 화면 로딩 (2초)
                    </Lib.Button>
                </div>
            ),
            description: "전체 화면 로딩 예시",
            code: `// useSharedStore 사용
const app = useSharedStore();

// 로딩 표시/해제
<Lib.Button onClick={() => {
    app.setLoading(true);
    setTimeout(() => app.setLoading(false), 2000);
}}>
    전체 화면 로딩 (2초)
</Lib.Button>`
        },
    ];

    return examples;
};

