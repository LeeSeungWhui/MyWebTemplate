/**
 * 파일명: EasyEditor.stories.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: EasyEditor 컴포넌트 Storybook 시나리오 정의
 */

import { useMemo, useState } from 'react';
import EasyEditor from '../app/lib/component/EasyEditor/EasyEditor.jsx';

const meta = {
  title: 'UI/Components/EasyEditor',
  component: EasyEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      disable: false,
    },
  },
  args: {
    label: 'Rich Description',
    helperText: 'Use the toolbar to format content or switch into HTML mode.',
  },
  argTypes: {
    dataObj: { control: false },
    dataKey: { control: false },
  },
};

export default meta;

export const ControlledHtml = {
  render: (args) => {
    const [value, setValue] = useState('<p>Welcome to EasyEditor!</p>');
    return (
      <div className="max-w-3xl space-y-4">
        <EasyEditor
          {...args}
          value={value}
          serialization="html"
          onValueChange={(next) => setValue(next)}
        />
        <div className="rounded border bg-white p-4 text-sm text-gray-700 shadow-sm">
          <h3 className="mb-2 font-semibold">Live HTML output</h3>
          <code className="block whitespace-pre-wrap break-words">{value}</code>
        </div>
      </div>
    );
  },
};

export const BoundToObject = {
  render: (args) => {
    const [profile, setProfile] = useState({
      summary: '<p><strong>Team Updates</strong> — Add links and highlights here.</p>',
    });

    const boundModel = useMemo(() => ({
      get: (key) => (key === 'summary' ? profile.summary : undefined),
      set: (key, value) => {
        if (key === 'summary') {
          setProfile((prev) => ({ ...prev, summary: value }));
        }
      },
    }), [profile]);

    return (
      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <EasyEditor
          {...args}
          dataObj={boundModel}
          dataKey="summary"
          serialization="html"
        />
        <div className="rounded border bg-white p-4 text-sm shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-900">Bound value</h3>
          <code className="block whitespace-pre-wrap break-words text-gray-600">
            {profile.summary}
          </code>
        </div>
      </div>
    );
  },
};

export const ReadOnlyReview = {
  args: {
    value: '<p>Release notes are locked after publication.</p>',
    serialization: 'html',
    readOnly: true,
    toolbar: false,
  },
};
