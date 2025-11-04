/**
 * 파일명: preview.js
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: Storybook 전역 파라미터 및 스타일 적용 설정
 */

import '../app/globals.css';

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#f8fafc' },
      { name: 'dark', value: '#0f172a' },
    ],
  },
  a11y: {
    disable: false,
  },
};
