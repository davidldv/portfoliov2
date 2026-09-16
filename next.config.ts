import type { NextConfig } from "next";

/**
 * Security headers. The CSP still allows inline scripts/styles because the
 * page is statically prerendered (Next's hydration payload is inline and GSAP
 * writes inline styles); everything external is locked to 'self' and the one
 * form endpoint. Moving to a nonce-based CSP means rendering dynamically via
 * proxy.ts — a deliberate trade-off for a static portfolio.
 */
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is dev-only: React's dev overlay needs it, production never does.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.web3forms.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
