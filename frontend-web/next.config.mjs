/** @type {import('next').NextConfig} */
const canvasStubPath = new URL('./app/lib/runtime/stubs/canvas.js', import.meta.url).pathname;

const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: canvasStubPath,
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: canvasStubPath,
    };

    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;
