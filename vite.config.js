import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/unique-paths-visualizer/', // <-- your GitHub repo name
  plugins: [react()]
})
