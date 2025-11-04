/**
 * ?뚯씪紐? LoadingExamples.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: Loading 而댄룷?뚰듃 ?덉젣
 */
import * as Lib from '@/app/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const LoadingExamples = () => {
    const setLoading = useSharedStore(s => s.setLoading);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 2000);
                    }}>
                        ?꾩껜 ?붾㈃ 濡쒕뵫 (2珥?
                    </Lib.Button>
                </div>
            ),
            description: "?꾩껜 ?붾㈃ 濡쒕뵫 ?덉떆",
            code: `// useSharedStore ?ъ슜
const setLoading = useSharedStore(s => s.setLoading);

// 濡쒕뵫 ?쒖떆/?댁젣
<Lib.Button onClick={() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
}}>
    ?꾩껜 ?붾㈃ 濡쒕뵫 (2珥?
</Lib.Button>`
        },
    ];

    return examples;
};


