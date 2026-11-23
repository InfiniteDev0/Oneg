/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    // Off on purpose: this project lives in a OneDrive folder, and the dev
    // cache on disk (.next/dev/cache) kept serving old pages and old CSS
    // (/en came back 404 from a cache of the app's April layout).
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
