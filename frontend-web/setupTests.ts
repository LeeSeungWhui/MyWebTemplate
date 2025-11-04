import '@testing-library/jest-dom';
import React from 'react';

// Vitest + esbuild default JSX runtime expects React global when using classic transform
// Ensure legacy components relying on `React` identifier still work in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React;
