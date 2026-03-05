import { q } from "framer-motion/client"

// vite.config.ts
export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      visualizer({ filename: 'stats.html' })
    ],
    base: './', // Change this from '/competency-radar/' to './'
  })