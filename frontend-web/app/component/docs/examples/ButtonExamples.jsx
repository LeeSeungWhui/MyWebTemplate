/**
 * 파일명: ButtonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Button 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description Button 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const variantExampleList = [{
  exampleId: 'primary',
  component: <Lib.Button icon="md:MdAdd">새 작업</Lib.Button>,
  description: "가장 중요한 기본 CTA",
  code: '<Lib.Button icon="md:MdAdd">새 작업</Lib.Button>'
}, {
  exampleId: 'secondary',
  component: <Lib.Button variant="secondary">임시저장</Lib.Button>,
  description: "보조 액션",
  code: '<Lib.Button variant="secondary">임시저장</Lib.Button>'
}, {
  exampleId: 'outline',
  component: <Lib.Button variant="outline">미리보기</Lib.Button>,
  description: "강조도를 낮춘 액션",
  code: '<Lib.Button variant="outline">미리보기</Lib.Button>'
}, {
  exampleId: 'ghost',
  component: <Lib.Button variant="ghost">취소</Lib.Button>,
  description: "배경이 없는 보조 액션",
  code: '<Lib.Button variant="ghost">취소</Lib.Button>'
}, {
  exampleId: 'danger',
  component: <Lib.Button variant="danger" icon="md:MdDelete">삭제</Lib.Button>,
  description: "파괴적 액션",
  code: '<Lib.Button variant="danger" icon="md:MdDelete">삭제</Lib.Button>'
}, {
  exampleId: 'success',
  component: <Lib.Button variant="success" icon="md:MdCheck">승인</Lib.Button>,
  description: "성공/승인 액션",
  code: '<Lib.Button variant="success" icon="md:MdCheck">승인</Lib.Button>'
}, {
  exampleId: 'warning',
  component: <Lib.Button variant="warning" icon="md:MdWarning">확인 필요</Lib.Button>,
  description: "주의가 필요한 액션",
  code: '<Lib.Button variant="warning" icon="md:MdWarning">확인 필요</Lib.Button>'
}, {
  exampleId: 'link',
  component: <Lib.Button variant="link" icon="md:MdOpenInNew" iconPosition="right">자세히 보기</Lib.Button>,
  description: "텍스트 링크형 액션",
  code: '<Lib.Button variant="link" icon="md:MdOpenInNew" iconPosition="right">자세히 보기</Lib.Button>'
}, {
  exampleId: 'dark',
  component: <Lib.Button variant="dark">관리자 실행</Lib.Button>,
  description: "Dark 버튼",
  code: '<Lib.Button variant="dark">관리자 실행</Lib.Button>'
}];
export const sizeExampleList = [{
  exampleId: 'small',
  component: <Lib.Button size="sm">Small</Lib.Button>,
  description: "테이블 행과 compact toolbar에 맞는 sm",
  code: '<Lib.Button size="sm">Small</Lib.Button>'
}, {
  exampleId: 'medium',
  component: <Lib.Button size="md" icon="ri:RiSearchLine">검색</Lib.Button>,
  description: "기본 폼 액션에 맞는 md + 아이콘",
  code: '<Lib.Button size="md" icon="ri:RiSearchLine">검색</Lib.Button>'
}, {
  exampleId: 'large',
  component: <Lib.Button size="lg">Large</Lib.Button>,
  description: "강조 CTA에 맞는 lg",
  code: '<Lib.Button size="lg">Large</Lib.Button>'
}, {
  exampleId: 'loading',
  component: <Lib.Button loading>저장 중</Lib.Button>,
  description: "loading은 aria-busy와 상태 안내를 함께 제공",
  code: '<Lib.Button loading>저장 중</Lib.Button>'
}, {
  exampleId: 'disabled',
  component: <Lib.Button disabled>권한 없음</Lib.Button>,
  description: "비활성화 상태",
  code: '<Lib.Button disabled>권한 없음</Lib.Button>'
}];
