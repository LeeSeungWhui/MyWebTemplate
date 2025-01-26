import * as Lib from '@/lib';
import { useState } from 'react';

export const ModalExamples = () => {
    const examples = [
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            기본 모달 열기
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">기본 모달</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>기본적인 모달 예시입니다.</p>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        닫기
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "기본 모달",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button onClick={() => setIsOpen(true)}>
    기본 모달 열기
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">기본 모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>기본적인 모달 예시입니다.</p>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
                닫기
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);
                const sizes = ['sm', 'md', 'lg', 'xl', 'full'];
                const [currentSize, setCurrentSize] = useState('md');

                return (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {sizes.map(size => (
                                <Lib.Button
                                    key={size}
                                    onClick={() => {
                                        setCurrentSize(size);
                                        setIsOpen(true);
                                    }}
                                >
                                    {size.toUpperCase()} 크기
                                </Lib.Button>
                            ))}
                        </div>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            size={currentSize}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} 크기 모달</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>다양한 크기의 모달을 지원합니다.</p>
                            </Lib.Modal.Body>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "모달 크기",
            code: `const [isOpen, setIsOpen] = useState(false);
const sizes = ['sm', 'md', 'lg', 'xl', 'full'];
const [currentSize, setCurrentSize] = useState('md');

<div className="flex flex-wrap gap-2">
    {sizes.map(size => (
        <Lib.Button
            key={size}
            onClick={() => {
                setCurrentSize(size);
                setIsOpen(true);
            }}
        >
            {size.toUpperCase()} 크기
        </Lib.Button>
    ))}
</div>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    size={currentSize}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} 크기 모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>다양한 크기의 모달을 지원합니다.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            폼 모달 열기
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">사용자 정보</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">이름</label>
                                        <Lib.Input className="mt-1" placeholder="이름을 입력하세요" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">이메일</label>
                                        <Lib.Input className="mt-1" type="email" placeholder="이메일을 입력하세요" />
                                    </div>
                                </form>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end gap-2">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        저장
                                    </Lib.Button>
                                    <Lib.Button
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        취소
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "폼이 포함된 모달",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button onClick={() => setIsOpen(true)}>
    폼 모달 열기
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">사용자 정보</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <Lib.Input className="mt-1" placeholder="이름을 입력하세요" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <Lib.Input className="mt-1" type="email" placeholder="이메일을 입력하세요" />
            </div>
        </form>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end gap-2">
            <Lib.Button onClick={() => setIsOpen(false)}>
                저장
            </Lib.Button>
            <Lib.Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
            >
                취소
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        }
    ];

    return examples;
}; 