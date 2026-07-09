/**
 * 파일명: app/sample/formatSampleDate.js
 * 작성자: LSH
 * 갱신일: 2026-07-09
 * 설명: 공개 샘플 화면 날짜 표시 포맷터
 */

export const formatSampleDate = (dateValue) => {
  const dateText = String(dateValue ?? "").trim();
  if (!dateText) return "-";

  const dateMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return dateText;

  return `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
};
