import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hide the floating dev badge so it doesn't cover the app's buttons.
  devIndicators: false,
};

export default nextConfig;
