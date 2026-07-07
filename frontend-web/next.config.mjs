/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
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
