import * as Lib from '@/lib';
import { useContext } from 'react';
import { AppContext } from '@/common/share/AppContext';

export const LoadingExamples = () => {
    const app = useContext(AppContext);

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
            description: "전체 화면 로딩 스피너",
            code: `// AppContext 사용
const app = useContext(AppContext);

// 로딩 스피너 표시/해제
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