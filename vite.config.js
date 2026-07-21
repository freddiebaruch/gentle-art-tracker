import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { env } from 'node:process'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves project sites below the repository name. The deployment
  // workflow supplies that path, while local development stays at the root URL.
  base: env.GITHUB_PAGES_BASE || '/',
})
