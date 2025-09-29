import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    domains: ['spot-boston-res.cloudinary.com'],
  },
};

export default nextConfig;
