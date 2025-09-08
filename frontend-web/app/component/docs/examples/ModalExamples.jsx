/* eslint-disable react-hooks/rules-of-hooks */
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
                            기본 모달 ?�기
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">기본 모달</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>기본?�인 모달 ?�시?�니??</p>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?�기
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
    기본 모달 ?�기
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">기본 모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>기본?�인 모달 ?�시?�니??</p>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?�기
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
                                    {size.toUpperCase()} ?�기
                                </Lib.Button>
                            ))}
                        </div>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            size={currentSize}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} ?�기 모달</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>?�양???�기??모달??지?�합?�다.</p>
                            </Lib.Modal.Body>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "모달 ?�기",
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
            {size.toUpperCase()} ?�기
        </Lib.Button>
    ))}
</div>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    size={currentSize}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} ?�기 모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>?�양???�기??모달??지?�합?�다.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            ??모달 ?�기
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?�용???�보</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">?�름</label>
                                        <Lib.Input className="mt-1" placeholder="?�름???�력?�세?? />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">?�메??/label>
                                        <Lib.Input className="mt-1" type="email" placeholder="?�메?�을 ?�력?�세?? />
                                    </div>
                                </form>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end gap-2">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?�??
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
            description: "?�이 ?�함??모달",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button onClick={() => setIsOpen(true)}>
    ??모달 ?�기
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?�용???�보</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">?�름</label>
                <Lib.Input className="mt-1" placeholder="?�름???�력?�세?? />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">?�메??/label>
                <Lib.Input className="mt-1" type="email" placeholder="?�메?�을 ?�력?�세?? />
            </div>
        </form>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end gap-2">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?�??
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
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            ?�래�?가?�한 모달 ?�기
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            draggable={true}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?�래�?가?�한 모달</h2>
                                <p className="text-sm text-gray-500">?�더�??�래그해???�동?????�습?�다</p>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>??모달?� ?�더 ?�역???�래그하???�동?????�습?�다.</p>
                                <p className="mt-2">?�면 밖으�??��?지 ?�도�??�한?�어 ?�습?�다.</p>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?�기
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "draggable prop??true�??�정?�면 모달???�래그할 ???�습?�다. ?�더 ?�역???�래그하???�동??가?�합?�다.",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    draggable={true}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?�래�?가?�한 모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>??모달?� ?�더 ?�역???�래그하???�동?????�습?�다.</p>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?�기
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => setIsOpen(true)}>
                                ?�측 ?�단??모달 ?�기
                            </Lib.Button>
                        </div>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            top="20px"
                            left="calc(100% - 20px - 32rem)"
                            draggable
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?�치 지??모달</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>top, left prop?�로 초기 ?�치�?지?�할 ???�습?�다.</p>
                                <p className="mt-2">?�래그하???�유�?�� ?�동?�보?�요.</p>
                            </Lib.Modal.Body>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "top, left prop?�로 모달??초기 ?�치�?지?�할 ???�습?�다. ?�래�?기능�??�께 ?�용?�면 ?�욱 ?�용?�니??",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    top="20px"
    left="calc(100% - 20px - 32rem)"
    draggable
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?�치 지??모달</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>top, left prop?�로 초기 ?�치�?지?�할 ???�습?�다.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
        }
    ];

    return examples;
}; 