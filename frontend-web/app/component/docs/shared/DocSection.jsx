/**
 * 파일명: DocSection.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 문서 섹션 래퍼
 */
/**
 * 파일명: DocSection.jsx
 * 설명: 문서 섹션 레이아웃 컴포넌트 (접근성 포함)
 */
const DocSection = ({ id, title, description, children }) => {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={titleId} className="mb-12">
      <h2 id={titleId} className="text-2xl font-semibold mb-4">{title}</h2>
      {description && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">설명</h4>
          <div className="text-sm text-gray-600">
            {description}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

export default DocSection;

