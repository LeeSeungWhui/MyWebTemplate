import DocSection from '../shared/DocSection';
import BadgeExamples from '../examples/BadgeExamples';

const BadgeDocs = () => (
  <section id="badges" className="space-y-4">
    <DocSection title="19. 배지/태그 (Badge/Tag)" anchor="badges">
      <p className="text-gray-700">상태 표시용 라벨. 색상/사이즈/필 모양 지원.</p>
      <BadgeExamples />
    </DocSection>
  </section>
);

export default BadgeDocs;

