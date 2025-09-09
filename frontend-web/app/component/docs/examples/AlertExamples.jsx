import * as Lib from '@/lib';
import { useRef } from 'react';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const AlertExamples = () => {
    const app = useSharedStore();
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("기본 알림 메시지입니다.");
                    }}>
                        기본 알림
                    </Lib.Button>
                </div>
            ),
            description: "기본 알림",
            code: `// useSharedStore 사용
const app = useSharedStore();

// 기본 알림
app.showAlert("기본 알림 메시지입니다.");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showAlert("정보 알림 메시지입니다.", {
                            title: "정보",
                            type: "info"
                        });
                    }}>
                        정보 알림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("성공 알림 메시지입니다.", {
                            title: "성공",
                            type: "success"
                        });
                    }}>
                        성공 알림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("경고 알림 메시지입니다.", {
                        경고 알림
                        app.showAlert("오류 알림 메시지입니다.", {
                            title: "오류",
                    }}>
                        오류 알림
                    </Lib.Button>
            description: "알림 유형",
            code: `// 정보 알림
app.showAlert("정보 알림 메시지입니다.", {
    title: "정보",
    type: "info",
// 성공 알림
app.showAlert("성공 알림 메시지입니다.", {
    title: "성공",
    type: "success",
// 경고 알림
app.showAlert("경고 알림 메시지입니다.", {
    type: "warning",
// 오류 알림
app.showAlert("오류 알림 메시지입니다.", {
    title: "오류",
    type: "error",
                        app.showAlert("작업이 완료되었습니다.", {
                            title: "알림",
                                alert("알림이 닫혔습니다.");
                        콜백 함수 예시
            description: "알림 클릭 콜백",
            code: `// 알림을 닫을 때 수행할 콜백 함수
app.showAlert("작업이 완료되었습니다.", {
    title: "알림",
        alert("알림이 닫혔습니다.");
                                app.showAlert("알림이 표시된 후 입력창으로 포커스 이동합니다.", {
                                    title: "알림",
                            알림 보기
                            placeholder="포커스가 여기로 이동합니다"
            description: "알림 후 지정된 요소로 포커스 이동",
            code: `// useRef로 입력창 참조 생성
// 알림 표시 후 입력창으로 포커스 이동
            app.showAlert("알림이 표시된 후 입력창으로 포커스 이동합니다.", {
                title: "알림",
        알림 보기
        placeholder="포커스가 여기로 이동합니다"
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("?戩梾???勲?橃棃?惦媹??", {
                            title: "?岆",
                            onClick: function () {
                                alert("?岆???様?惦媹??");
                            }
                        });
                    }}>
                        旖滊氨 ?垬 ?堨嫓
                    </Lib.Button>
                </div>
            ),
            description: "?岆 ?灅 旖滊氨",
            code: `// ?岆???瀽 ???ろ枆??旖滊氨 ?垬
app.showAlert("?戩梾???勲?橃棃?惦媹??", {
    title: "?岆",
    onClick: function() {
        alert("?岆???様?惦媹??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            ref={buttonRef}
                            onClick={() => {
                                app.showAlert("?岆???瀳氅??呺牓彀届溂搿??护?り? ?措彊?╇媹??", {
                                    title: "?岆",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?岆 ?搓赴
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?护?り? ?赴搿??措彊?╇媹??
                        />
                    </div>
                </div>
            ),
            description: "?岆 ?灅 ???护?り? 歆�?曤悳 ?旍唽搿??措彊?╇媹??",
            code: `// useRef ?呾溂搿??呺牓彀?彀胳“ ?濎劚
const inputRef = useRef(null);

// ?岆???瀽 ???呺牓彀届溂搿??护???措彊
<div className="flex gap-4 items-center">
    <Lib.Button
        ref={buttonRef}
        onClick={() => {
            app.showAlert("?岆???瀳氅??呺牓彀届溂搿??护?り? ?措彊?╇媹??", {
                title: "?岆",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?岆 ?搓赴
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="?护?り? ?赴搿??措彊?╇媹??
    />
</div>`
        }
    ];

    return examples;
};


