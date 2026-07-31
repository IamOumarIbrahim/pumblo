import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Vinext applies the server-action guard to every App Router POST request.
    // The upload route streams the body into R2, so this is a request ceiling,
    // not an in-memory buffer allocation.
    serverActions: {
      bodySizeLimit: "92mb",
    },
  },
};

export default nextConfig;
