/**
 * 파일명: PdfViewer.stories.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: PdfViewer 컴포넌트 Storybook 시나리오 정의
 */

import PdfViewer from '../app/lib/component/PdfViewer/PdfViewer.jsx';

const meta = {
  title: 'UI/Components/PdfViewer',
  component: PdfViewer,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      disable: false,
    },
  },
  args: {
    src: '/pdf-sample.pdf',
    initialPage: 1,
    withToolbar: true,
  },
  tags: ['autodocs'],
};

export default meta;

export const WithToolbar = {};

export const WithoutToolbar = {
  args: {
    withToolbar: false,
  },
};

export const ErrorState = {
  args: {
    src: '/missing-sample.pdf',
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders the inline Empty state when the document cannot be loaded (403/404/network).',
      },
    },
  },
};
