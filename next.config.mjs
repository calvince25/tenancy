/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors will not fail the build — fix them iteratively
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors will not fail the build — fix them iteratively
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
