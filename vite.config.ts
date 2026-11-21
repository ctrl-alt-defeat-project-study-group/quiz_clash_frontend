import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  let proxyTarget = 'http://localhost:8000'
  try {
    proxyTarget = new URL(rawApiUrl).origin
  } catch {
    // Fallback if relative URL is passed
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          ws: true,
          cookieDomainRewrite: '',
          headers: {
            Origin: proxyTarget,
            Referer: `${proxyTarget}/`,
          },
        },
      },
    },
  }
})
