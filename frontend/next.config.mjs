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
      // Legacy /host alias → extend existing /owner (do not keep a parallel host app)
      { source: "/host", destination: "/owner", permanent: false },
      { source: "/host/dashboard", destination: "/owner", permanent: false },
      { source: "/host/properties", destination: "/owner", permanent: false },
      {
        source: "/host/properties/new",
        destination: "/owner/properties/new",
        permanent: false,
      },
      {
        source: "/host/properties/:id",
        destination: "/owner/properties/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
