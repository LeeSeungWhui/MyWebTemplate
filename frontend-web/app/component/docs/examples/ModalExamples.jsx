"use client";

/**
 * 파일명: ModalExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Modal 컴포넌트 예제
 */

import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BasicModalDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BasicModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">고객 상태 변경 확인</p>
          <p className="mt-1 text-sm text-slate-500">중요 변경 전 요약과 액션을 한 화면에서 확인합니다.</p>
        </div>
        <Lib.Button icon="ri:RiCheckboxCircleLine" onClick={() => setIsOpen(true)}>
          기본 모달 열기
        </Lib.Button>
      </div>

      <Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} ariaLabel="고객 상태 변경 확인 모달">
        <Lib.Modal.Header onClose={() => setIsOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">CUSTOMER STATUS</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">상담 완료로 변경할까요?</h2>
          <p className="mt-1 text-sm text-slate-500">변경 전에 고객 정보와 처리 내용을 확인하세요.</p>
        </Lib.Modal.Header>

        <Lib.Modal.Body>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-700">변경 상태</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">상담 완료</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">김민준 고객의 문의 상태와 마지막 상담 시간을 함께 갱신합니다.</p>
            </div>
            <ul className="grid gap-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" />처리 메모 저장 완료</li>
              <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-indigo-500" />후속 안내 발송 예정</li>
            </ul>
          </div>
        </Lib.Modal.Body>

        <Lib.Modal.Footer>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">ESC 또는 배경 클릭으로 닫을 수 있습니다.</span>
            <div className="flex justify-end gap-2">
              <Lib.Button variant="outline" onClick={() => setIsOpen(false)}>
                나중에
              </Lib.Button>
              <Lib.Button onClick={() => setIsOpen(false)}>
                확인
              </Lib.Button>
            </div>
          </div>
        </Lib.Modal.Footer>
      </Lib.Modal>
    </div>;
};

/**
 * @description SizeModalDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const SizeModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSize, setCurrentSize] = useState('md');
  const modalSizeList = ['sm', 'md', 'lg', 'xl', 'full'];

  return <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
      <div>
        <p className="text-sm font-semibold text-slate-900">사이즈 프리셋</p>
        <p className="mt-1 text-sm text-slate-500">작업 밀도에 따라 sm부터 full까지 선택합니다.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {modalSizeList.map((size) => <Lib.Button key={size} variant={size === currentSize ? 'primary' : 'outline'} onClick={() => {
          setCurrentSize(size);
          setIsOpen(true);
        }}>
          {size.toUpperCase()} 크기
        </Lib.Button>)}
      </div>

      <Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={currentSize} ariaLabel={`${currentSize.toUpperCase()} 크기 모달`}>
        <Lib.Modal.Header onClose={() => setIsOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Preset size</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{currentSize.toUpperCase()} 크기 모달</h2>
          <p className="mt-1 text-sm text-slate-500">현재 선택된 size prop은 <code>{currentSize}</code>입니다.</p>
        </Lib.Modal.Header>

        <Lib.Modal.Body>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm text-slate-600">목록, 폼, 확인 작업 등 콘텐츠 밀도에 맞춰 같은 스타일 체계를 유지합니다.</p>
          </div>
        </Lib.Modal.Body>
      </Lib.Modal>
    </div>;
};

/**
 * @description FormModalDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const FormModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <Lib.Button icon="ri:RiUserSettingsLine" onClick={() => setIsOpen(true)}>
        폼 모달 열기
      </Lib.Button>

      <Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" ariaLabel="사용자 정보 편집 모달">
        <Lib.Modal.Header onClose={() => setIsOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Profile</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">사용자 정보</h2>
          <p className="mt-1 text-sm text-slate-500">입력 필드와 액션 버튼이 포함된 폼 모달 예시입니다.</p>
        </Lib.Modal.Header>

        <Lib.Modal.Body>
          <form className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">이름</label>
              <Lib.Input className="mt-1" placeholder="이름을 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">이메일</label>
              <Lib.Input className="mt-1" type="email" placeholder="이메일을 입력하세요" />
            </div>
          </form>
        </Lib.Modal.Body>

        <Lib.Modal.Footer>
          <div className="flex justify-end gap-2">
            <Lib.Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Lib.Button>
            <Lib.Button onClick={() => setIsOpen(false)}>
              저장
            </Lib.Button>
          </div>
        </Lib.Modal.Footer>
      </Lib.Modal>
    </div>;
};

/**
 * @description DragModalDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DragModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
      <Lib.Button icon="ri:RiDragMove2Line" onClick={() => setIsOpen(true)}>
        드래그 가능한 모달 열기
      </Lib.Button>

      <Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} draggable={true} ariaLabel="드래그 가능한 모달">
        <Lib.Modal.Header onClose={() => setIsOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Draggable</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">드래그 가능한 모달</h2>
          <p className="mt-1 text-sm text-slate-500">헤더를 잡고 이동할 수 있습니다.</p>
        </Lib.Modal.Header>

        <Lib.Modal.Body>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">이동 가능</p>
              <p className="mt-1 text-sm text-slate-500">헤더 영역에서만 drag start를 허용합니다.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">뷰포트 보호</p>
              <p className="mt-1 text-sm text-slate-500">화면 밖으로 나가지 않도록 위치를 제한합니다.</p>
            </div>
          </div>
        </Lib.Modal.Body>

        <Lib.Modal.Footer>
          <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
              닫기
            </Lib.Button>
          </div>
        </Lib.Modal.Footer>
      </Lib.Modal>
    </div>;
};

/**
 * @description PositionModalDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const PositionModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex gap-2">
        <Lib.Button icon="ri:RiLayoutRightLine" onClick={() => setIsOpen(true)}>
          우측 상단에 모달 열기
        </Lib.Button>
      </div>

      <Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} top="20px" left="calc(100% - 20px - 512px)" draggable ariaLabel="위치 지정 모달">
        <Lib.Modal.Header onClose={() => setIsOpen(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Positioned</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">위치 지정 모달</h2>
          <p className="mt-1 text-sm text-slate-500">초기 좌표를 지정한 뒤 드래그로 이동할 수 있습니다.</p>
        </Lib.Modal.Header>

        <Lib.Modal.Body>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5">
            <p className="text-sm font-semibold text-slate-900">top="20px"</p>
            <p className="mt-1 text-sm text-slate-500">left="calc(100% - 20px - 512px)"로 우측 상단에 배치합니다.</p>
          </div>
        </Lib.Modal.Body>
      </Lib.Modal>
    </div>;
};

/**
 * @description Modal 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @returns { basicExampleList: Array, sizeExampleList: Array, formExampleList: Array, dragExampleList: Array, positionExampleList: Array }
 * @updated 2026-02-24
 */
export const basicExampleList = [{
  component: <BasicModalDemo />,
  description: "확인 작업에 쓰는 기본 모달",
  code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button icon="ri:RiCheckboxCircleLine" onClick={() => setIsOpen(true)}>
  기본 모달 열기
</Lib.Button>

<Lib.Modal isOpen={isOpen} onClose={() => setIsOpen(false)} ariaLabel="고객 상태 변경 확인 모달">
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">CUSTOMER STATUS</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">상담 완료로 변경할까요?</h2>
        <p className="mt-1 text-sm text-slate-500">변경 전에 고객 정보와 처리 내용을 확인하세요.</p>
    </Lib.Modal.Header>

    <Lib.Modal.Body>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">...</div>
    </Lib.Modal.Body>

    <Lib.Modal.Footer>
        <div className="flex justify-end gap-2">...</div>
    </Lib.Modal.Footer>
</Lib.Modal>`
}];
export const sizeExampleList = [{
  component: <SizeModalDemo />,
  description: "모달 크기",
  code: `const [isOpen, setIsOpen] = useState(false);
const modalSizeList = ['sm', 'md', 'lg', 'xl', 'full'];
const [currentSize, setCurrentSize] = useState('md');

<div className="flex flex-wrap gap-2">
    {modalSizeList.map(size => (
        <Lib.Button key={size} variant={size === currentSize ? 'primary' : 'outline'} onClick={() => {
            setCurrentSize(size);
            setIsOpen(true);
        }}>
            {size.toUpperCase()} 크기
        </Lib.Button>
    ))}
</div>

<Lib.Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    size={currentSize}
    ariaLabel={\`\${currentSize.toUpperCase()} 크기 모달\`}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Preset size</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{currentSize.toUpperCase()} 크기 모달</h2>
    </Lib.Modal.Header>
</Lib.Modal>`
}];
export const formExampleList = [{
  component: <FormModalDemo />,
  description: "폼이 포함된 모달",
  code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button icon="ri:RiUserSettingsLine" onClick={() => setIsOpen(true)}>
    폼 모달 열기
</Lib.Button>

<Lib.Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    size="lg"
    ariaLabel="사용자 정보 편집 모달"
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Profile</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">사용자 정보</h2>
    </Lib.Modal.Header>

    <Lib.Modal.Body>
        <form className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className="block text-sm font-medium text-slate-700">이름</label>
                <Lib.Input className="mt-1" placeholder="이름을 입력하세요" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">이메일</label>
                <Lib.Input className="mt-1" type="email" placeholder="이메일을 입력하세요" />
            </div>
        </form>
    </Lib.Modal.Body>

    <Lib.Modal.Footer>
        <div className="flex justify-end gap-2">
            <Lib.Button variant="outline" onClick={() => setIsOpen(false)}>취소</Lib.Button>
            <Lib.Button onClick={() => setIsOpen(false)}>저장</Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
}];
export const dragExampleList = [{
  component: <DragModalDemo />,
  description: "draggable prop을 true로 설정하면 모달을 드래그할 수 있습니다. 헤더 영역을 드래그하여 이동이 가능합니다.",
  code: `<Lib.Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    draggable
    ariaLabel="드래그 가능한 모달"
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Draggable</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">드래그 가능한 모달</h2>
    </Lib.Modal.Header>

    <Lib.Modal.Body>...</Lib.Modal.Body>
</Lib.Modal>`
}];
export const positionExampleList = [{
  component: <PositionModalDemo />,
  description: "top, left prop으로 모달의 초기 위치를 지정할 수 있습니다. 드래그 기능과 함께 사용하면 더욱 유용합니다.",
  code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    top="20px"
    left="calc(100% - 20px - 512px)"
    draggable
    ariaLabel="위치 지정 모달"
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Positioned</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">위치 지정 모달</h2>
    </Lib.Modal.Header>

    <Lib.Modal.Body>
        <p>top, left prop으로 초기 위치를 지정할 수 있습니다.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
}];
