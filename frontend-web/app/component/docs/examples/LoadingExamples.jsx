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
                        ?„ì²´ ?”ë©´ ë¡œë”© (2ì´?
                    </Lib.Button>
                </div>
            ),
            description: "?„ì²´ ?”ë©´ ë¡œë”© ?¤í”¼??,
            code: `// Àü¿ª ½ºÅä¾î ?¬ìš©
const app = useSharedStore();

// ë¡œë”© ?¤í”¼???œì‹œ/?´ì œ
<Lib.Button onClick={() => {
    app.setLoading(true);
    setTimeout(() => app.setLoading(false), 2000);
}}>
    ?„ì²´ ?”ë©´ ë¡œë”© (2ì´?
</Lib.Button>`
        },
    ];

    return examples;
}; 
