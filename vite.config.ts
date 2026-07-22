import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(() => ({
  // Cloudflare Pages 与自定义域名均从站点根路径提供静态资源。
  base: '/',
  plugins: [react(), cloudflare()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
}))