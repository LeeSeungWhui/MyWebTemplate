import * as Lib from '@/lib';
import { useSharedStore } from '@/app/common/store/Shared';

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
                        ?�체 ?�면 로딩 (2�?
                    </Lib.Button>
                </div>
            ),
            description: "?�체 ?�면 로딩 ?�피??,
            code: `// ���� ����� ?�용
const app = useSharedStore();

// 로딩 ?�피???�시/?�제
<Lib.Button onClick={() => {
    app.setLoading(true);
    setTimeout(() => app.setLoading(false), 2000);
}}>
    ?�체 ?�면 로딩 (2�?
</Lib.Button>`
        },
    ];

    return examples;
}; 
