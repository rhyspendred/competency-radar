import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
plugins: [
react(),
tailwindcss(),
visualizer({ filename: 'stats.html' })
],
base: '/react-starter-template/',
})