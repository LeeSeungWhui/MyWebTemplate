"use client";
/**
 * 파일명: SwitchExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Switch 컴포넌트 예제
 */
import * as Lib from '@/lib';
import { useState } from 'react';

export const SwitchExamples = () => {
  const obj = Lib.EasyObj({ enabled: false, notifications: true });
  const [local, setLocal] = useState(false);

  const examples = [
    {
      component: (
        <div className="flex items-center gap-4">
          <Lib.Switch
            dataObj={obj}
            dataKey="enabled"
            label={`바운드: ${obj.enabled ? 'ON' : 'OFF'}`}
            onValueChange={(v) => console.log('switch(bound):', v)}
          />
          <span className="text-sm text-gray-600">obj.enabled = {String(obj.enabled)}</span>
        </div>
      ),
      description: 'dataObj + dataKey 로 상태 바인딩',
      code: `const obj = Lib.EasyObj({ enabled: false });

<Lib.Switch
  dataObj={obj}
  dataKey="enabled"
  label={\`바운드: \${obj.enabled ? 'ON' : 'OFF'}\`}
  onValueChange={(v) => console.log('switch(bound):', v)}
/>`
    },
    {
      component: (
        <div className="flex items-center gap-4">
          <Lib.Switch
            checked={local}
            onValueChange={(v) => setLocal(v)}
            label={`컨트롤드: ${local ? 'ON' : 'OFF'}`}
          />
          <span className="text-sm text-gray-600">local = {String(local)}</span>
        </div>
      ),
      description: '컨트롤드 모드 (checked + onValueChange)',
      code: `const [local, setLocal] = useState(false);

<Lib.Switch
  checked={local}
  onValueChange={(v) => setLocal(v)}
  label={\`컨트롤드: ${local ? 'ON' : 'OFF'}\`}
/>`
    },
    {
      component: (
        <div className="flex items-center gap-4">
          <Lib.Switch disabled defaultChecked label="비활성화" />
          <Lib.Switch disabled label="비활성화 (OFF)" />
        </div>
      ),
      description: 'disabled / defaultChecked 조합',
      code: `<Lib.Switch disabled defaultChecked label="비활성화" />
<Lib.Switch disabled label="비활성화 (OFF)" />`
    },
    {
      component: (
        <div className="flex items-center gap-4">
          <Lib.Switch
            dataObj={obj}
            dataKey="notifications"
            id="notify-switch"
            label="알림 허용"
          />
        </div>
      ),
      description: '접근성: id/label 로 명확한 레이블 제공',
      code: `<Lib.Switch
  dataObj={obj}
  dataKey="notifications"
  id="notify-switch"
  label="알림 허용"
/>`
    }
  ];

  return examples;
};

