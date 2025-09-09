import DocSection from '../shared/DocSection';
import * as Lib from '@/lib';
import SwitchExamples from '../examples/SwitchExamples';

const SwitchDocs = () => {
  return (
    <section id="switches" className="space-y-4">
      <DocSection title="16. 스위치 (Switch)" anchor="switches">
        <p className="text-gray-700">접근성 준수 role="switch"/aria-checked 적용. dataObj+dataKey 또는 controlled 지원.</p>
        <SwitchExamples />
      </DocSection>
    </section>
  );
};

export default SwitchDocs;

