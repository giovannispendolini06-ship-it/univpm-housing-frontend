/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      { source: "/per-proprietari", destination: "/proprietari", permanent: true },
      { source: "/come-funziona", destination: "/esempi", permanent: false },
      { source: "/trova-casa", destination: "/stanze", permanent: false },
      { source: "/host/dashboard", destination: "/owner", permanent: false },
    ];
  },
};

export default nextConfig;
