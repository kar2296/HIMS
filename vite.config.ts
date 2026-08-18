import { defineConfig } from 'vite'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    babel({
      presets: [reactCompilerPreset()],
      include: ['src/**/*.{ts,tsx}']
    }),
    {
      name: 'disable-html-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Rewrite /app/ to / so Vite can find legacy assets in the public folder
          if (req.url && req.url.startsWith('/app/')) {
            req.url = req.url.replace(/^\/app/, '');
          }

          const pathname = req.url ? req.url.split('?')[0] : '';
          if (pathname.endsWith('.html') && pathname !== '/index.html' && pathname !== '/') {
            // Prevent connect-history-api-fallback from rewriting template requests
            req.headers.accept = 'text/plain'; 
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2012',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    watch: {
      ignored: ['**/api/**', '**/.scannerwork/**', '**/dist/**', '**/.git/**']
    }
  }
})
