/**
 * 파일명: main.js
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: Storybook 기본 설정 및 애드온 구성
 */

module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
};
