/**
 * 파일명: app/dashboard/tasks/lang.ko.js
 * 작성자: LSH
 * 갱신일: 2026-02-25
 * 설명: tasks 경로 한국어 리소스
 */

export const LANG_KO = {
  page: {
    metadataTitle: "Dashboard Tasks | MyWebTemplate",
  },
  initData: {
    statusFilterList: [
      { value: "", text: "전체 상태" },
      { value: "ready", text: "준비" },
      { value: "pending", text: "대기" },
      { value: "running", text: "진행중" },
      { value: "done", text: "완료" },
      { value: "failed", text: "실패" },
    ],
    sortFilterList: [
      { value: "reg_dt_desc", text: "등록일 최신순" },
      { value: "reg_dt_asc", text: "등록일 오래된순" },
      { value: "amt_desc", text: "금액 높은순" },
      { value: "amt_asc", text: "금액 낮은순" },
      { value: "title_asc", text: "제목 오름차순" },
      { value: "title_desc", text: "제목 내림차순" },
    ],
  },
  view: {
    statusLabelMap: {
      ready: "준비",
      pending: "대기",
      running: "진행중",
      done: "완료",
      failed: "실패",
    },
    error: {
      listEndpointMissing: "업무 목록 API가 설정되지 않았습니다.",
      listLoadFailed: "업무 목록을 불러오지 못했습니다.",
      detailEndpointMissing: "상세 API 경로가 설정되지 않았습니다.",
      detailLoadFailed: "업무 상세를 불러오지 못했습니다.",
      createEndpointMissing: "생성 API 경로가 설정되지 않았습니다.",
      updateEndpointMissing: "수정 API 경로가 설정되지 않았습니다.",
      removeEndpointMissing: "삭제 API 경로가 설정되지 않았습니다.",
      saveFailed: "업무 저장에 실패했습니다.",
      removeFailed: "업무 삭제에 실패했습니다.",
      requestIdLabel: "requestId",
    },
    validation: {
      titleRequired: "제목은 필수입니다.",
      invalidStatus: "상태 값이 유효하지 않습니다.",
    },
    confirm: {
      removeText: "정말 삭제하시겠습니까?",
      removeTitle: "업무 삭제",
      confirmText: "삭제",
      cancelText: "취소",
    },
    toast: {
      savedCreated: "업무가 등록되었습니다.",
      savedUpdated: "업무가 수정되었습니다.",
      removed: "업무가 삭제되었습니다.",
    },
    table: {
      titleHeader: "제목",
      statusHeader: "상태",
      amountHeader: "금액",
      createdAtHeader: "등록일",
      actionsHeader: "관리",
      tagsHeader: "태그",
      emptyFallback: "업무가 없습니다.",
      loadFailedFallback: "업무 목록을 불러오지 못했습니다.",
    },
    search: {
      keywordPlaceholder: "제목/설명 검색",
      searchButton: "검색",
      resetButton: "초기화",
    },
    card: {
      managementTitle: "업무 관리",
      tableTitle: "업무 목록",
      quickCreateButton: "업무 등록",
    },
    drawer: {
      createTitle: "업무 등록",
      editTitle: "업무 수정",
      createSubtitle: "신규 업무를 등록합니다.",
      editSubtitlePrefix: "업무 번호 #",
      titleLabel: "제목",
      titlePlaceholder: "업무 제목을 입력해주세요",
      statusLabel: "상태",
      amountLabel: "금액",
      tagsLabel: "태그",
      tagsPlaceholder: "예) batch, report",
      descriptionLabel: "설명",
      descriptionPlaceholder: "업무 설명을 입력해주세요",
      cancelButton: "취소",
      saveButton: "저장",
    },
    action: {
      editButton: "수정",
      removeButton: "삭제",
      bulkRemoveButton: "선택 삭제",
      selectedCountSuffix: "건 선택",
      totalCountSuffix: "건",
    },
    misc: {
      unknownOwner: "담당자 미지정",
      noData: "없음",
      currencyZero: "0",
      dateUnknown: "-",
      drawerLoading: "상세 데이터를 불러오는 중...",
      defaultStatusCode: "ready",
    },
  },
};

/**
 * @description LANG_KO export를 노출한다.
 */
export default LANG_KO;
