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
