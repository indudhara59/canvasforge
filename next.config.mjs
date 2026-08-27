/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // konva's Node entry point requires the native `canvas` package, which
    // webpack tries (and fails) to resolve even though react-konva only
    // renders client-side. Stub it out — it's never actually reached.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
