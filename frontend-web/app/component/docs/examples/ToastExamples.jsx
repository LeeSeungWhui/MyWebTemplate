"use client";
/**
 * 파일명: ToastExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Toast 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

export const ToastExamples = () => {
  const { showToast } = useGlobalUi();

  const examples = [
    {
      component: (
        <div className="space-y-4">
          <Lib.Button onClick={() => showToast('기본 토스트 메시지입니다.')}>기본 토스트</Lib.Button>
        </div>
      ),
      description: '기본 토스트',
      code: `// useSharedStore 사용
const { showToast } = useGlobalUi();

// 기본 토스트
showToast('기본 토스트 메시지입니다.');`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2">
          <Lib.Button onClick={() => showToast('정보 토스트 메시지입니다.', { type: 'info' })}>정보 토스트</Lib.Button>
          <Lib.Button onClick={() => showToast('성공 토스트 메시지입니다.', { type: 'success' })}>성공 토스트</Lib.Button>
          <Lib.Button onClick={() => showToast('경고 토스트 메시지입니다.', { type: 'warning' })}>경고 토스트</Lib.Button>
          <Lib.Button onClick={() => showToast('오류 토스트 메시지입니다.', { type: 'error' })}>오류 토스트</Lib.Button>
        </div>
      ),
      description: '토스트 유형',
      code: `// 정보 토스트
showToast('정보 토스트 메시지입니다.', { type: 'info' });

// 성공 토스트
showToast('성공 토스트 메시지입니다.', { type: 'success' });

// 경고 토스트
showToast('경고 토스트 메시지입니다.', { type: 'warning' });

// 오류 토스트
showToast('오류 토스트 메시지입니다.', { type: 'error' });`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2">
          <Lib.Button onClick={() => showToast('상단 왼쪽에 표시합니다.', { position: 'top-left' })}>상단 왼쪽</Lib.Button>
          <Lib.Button onClick={() => showToast('상단 중앙에 표시합니다.', { position: 'top-center' })}>상단 중앙</Lib.Button>
          <Lib.Button onClick={() => showToast('상단 오른쪽에 표시합니다.', { position: 'top-right' })}>상단 오른쪽</Lib.Button>
          <Lib.Button onClick={() => showToast('하단 왼쪽에 표시합니다.', { position: 'bottom-left' })}>하단 왼쪽</Lib.Button>
          <Lib.Button onClick={() => showToast('하단 중앙에 표시합니다.', { position: 'bottom-center' })}>하단 중앙</Lib.Button>
          <Lib.Button onClick={() => showToast('하단 오른쪽에 표시합니다.', { position: 'bottom-right' })}>하단 오른쪽</Lib.Button>
        </div>
      ),
      description: '토스트 위치',
      code: `// 상단 왼쪽
showToast('상단 왼쪽에 표시합니다.', { position: 'top-left' });

// 상단 중앙
showToast('상단 중앙에 표시합니다.', { position: 'top-center' });

// 상단 오른쪽
showToast('상단 오른쪽에 표시합니다.', { position: 'top-right' });

// 하단 왼쪽
showToast('하단 왼쪽에 표시합니다.', { position: 'bottom-left' });

// 하단 중앙
showToast('하단 중앙에 표시합니다.', { position: 'bottom-center' });

// 하단 오른쪽
showToast('하단 오른쪽에 표시합니다.', { position: 'bottom-right' });`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2">
          <Lib.Button onClick={() => showToast('2초에 사라집니다.', { duration: 2000 })}>2초 유지</Lib.Button>
          <Lib.Button onClick={() => showToast('5초에 사라집니다.', { duration: 5000 })}>5초 유지</Lib.Button>
          <Lib.Button onClick={() => showToast('자동으로 사라지지 않습니다.', { duration: Infinity })}>자동 닫기 비활성화</Lib.Button>
        </div>
      ),
      description: '토스트 유지 시간',
      code: `// 2초 유지
showToast('2초에 사라집니다.', { duration: 2000 });

// 5초 유지
showToast('5초에 사라집니다.', { duration: 5000 });

// 자동 닫기 비활성화
showToast('자동으로 사라지지 않습니다.', { duration: Infinity });`
    }
  ];

  return examples;
};
