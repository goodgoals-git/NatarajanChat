import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you use other Vite features (envPrefix, base, build options), add them here.
export default defineConfig({
  plugins: [react()],
})
