import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Automatically load environment variables (e.g., VITE_API_URL)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // ⚙️ Server configuration (Development only)
    server: {
      port: 5173, // You can change this if needed
      open: true, // Auto-open in browser
      cors: true, // Enable CORS for frontend development

      // 🧠 Smart proxy setup for backend API requests
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // keep endpoint structure
        },
      },
    },

    // 🧩 Build optimization for production
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'esbuild',
    },

    // 🌈 Resolve aliases (optional but clean)
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
