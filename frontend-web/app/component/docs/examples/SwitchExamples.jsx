"use client";
import * as Lib from '@/lib';
import { useState } from 'react';

const SwitchExamples = () => {
  const obj = Lib.EasyObj({ enabled: false });
  const [local, setLocal] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Lib.Switch dataObj={obj} dataKey="enabled" label={`바운드: ${obj.enabled ? 'ON' : 'OFF'}`} onValueChange={(v, ctx) => console.log('switch bound', v, ctx)} />
        <span className="text-sm text-gray-600">obj.enabled = {String(obj.enabled)}</span>
      </div>
      <div className="flex items-center gap-4">
        <Lib.Switch checked={local} onValueChange={(v) => setLocal(v)} label={`컨트롤드: ${local ? 'ON' : 'OFF'}`} />
      </div>
    </div>
  );
};

export default SwitchExamples;

