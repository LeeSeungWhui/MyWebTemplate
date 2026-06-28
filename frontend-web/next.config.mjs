/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    '/*': ['./next.config.mjs'],
  },
  turbopack: {
    resolveAlias: {
      canvas: './app/lib/runtime/stubs/canvas.js',
      'canvas$': './app/lib/runtime/stubs/canvas.js',
    },
  },
};

export default nextConfig;
