import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { seoPlugin } from './seo-plugin';

// Open the app at http://<school-slug>.localhost:5173 (e.g. demo.localhost) or the
// platform console at http://admin.localhost:5173. The proxy keeps the original Host
// header so the API can resolve the tenant.
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin({ origin: 'https://ed-tech.anetcybersolution.com', api: 'http://localhost:3000' })],
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
    allowedHosts: ['.localhost', '.ed-tech.anetcybersolution.com'],
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
      // Search engines look for the sitemap at the site root; the API builds it from the schools.
      '/sitemap.xml': { target: 'http://localhost:3000', changeOrigin: false, rewrite: () => '/api/public/sitemap.xml' },
    },
  },
});
