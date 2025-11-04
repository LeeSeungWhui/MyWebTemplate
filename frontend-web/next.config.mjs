import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const canvasStubPath = path.join(__dirname, 'app/lib/runtime/stubs/canvas.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: './app/lib/runtime/stubs/canvas.js',
      'canvas$': './app/lib/runtime/stubs/canvas.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: canvasStubPath,
      'canvas$': canvasStubPath,
    };
    return config;
  },
};

export default nextConfig;
