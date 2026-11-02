import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { seoPlugin } from './seo-plugin';

// The one inline script (theme, before first paint) is allowed by its hash, so no other inline script can run.
const inlineHashes = [...readFileSync(new URL('./index.html', import.meta.url), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`).join(' ');

// Browser-side defences, sent with every page: no foreign scripts, no framing (clickjacking), no MIME sniffing.
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' ${inlineHashes} https://accounts.google.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https://accounts.google.com",
    "frame-src https://accounts.google.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.openstreetmap.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

// Open the app at http://<school-slug>.localhost:5173 (e.g. demo.localhost) or the
// platform console at http://admin.localhost:5173. The proxy keeps the original Host
// header so the API can resolve the tenant.
export default defineConfig({
  plugins: [react(), tailwindcss(),
    // `preview.headers` skips the HTML pages, which are the ones that need the policy.
    { name: 'security-headers', configurePreviewServer: (server) => { server.middlewares.use((_req, res, next) => { for (const [k, v] of Object.entries(securityHeaders)) res.setHeader(k, v); next(); }); } }, seoPlugin({ origin: 'https://ed-tech.anetcybersolution.com', api: 'http://localhost:3000' })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Lazily imported (export/import buttons): pre-bundle them so the dev server never serves a stale copy.
  optimizeDeps: { include: ['write-excel-file/browser', 'read-excel-file/browser'] },
  build: {
    // The only chunk above Vite's default 500 kB is the lazily loaded three.js hero
    // (~245 kB gzipped), fetched only on the login and dashboard screens.
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['.localhost', '.ed-tech.anetcybersolution.com'],
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
    },
  },
  // Production: `vite build`, then `vite preview` serves dist/ (with the same /api proxy) behind nginx.
  preview: {
    port: 5173,
    strictPort: true,
    headers: securityHeaders,
    allowedHosts: ['.localhost', '.ed-tech.anetcybersolution.com'],
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
      // Search engines look for the sitemap at the site root; the API builds it from the schools.
      '/sitemap.xml': { target: 'http://localhost:3000', changeOrigin: false, rewrite: () => '/api/public/sitemap.xml' },
    },
  },
});
