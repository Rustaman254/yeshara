import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's dev server rejects cross-origin requests by default (CSRF
  // protection against DNS rebinding). Running `npm run tunnel` puts the
  // dev server behind an ngrok URL instead of localhost, so its domains
  // need to be allowlisted here or every page load 403s. Covers ngrok's
  // free-tier domains (ngrok-free.app is current, ngrok-free.dev/ngrok.io
  // are older generations still seen on existing tunnels) and paid custom
  // domains under ngrok.app.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.io", "*.ngrok.app"],
};

export default nextConfig;
