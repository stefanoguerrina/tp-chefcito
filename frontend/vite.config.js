import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, Vite compila cada página (JSX y SASS) la primera vez que se pide. Con
    // warmup las compila al arrancar `npm run dev`, así la primera visita a cada pantalla
    // no tiene que esperar esa compilación. No afecta al build de producción. Las secciones
    // del panel admin se cargan aparte (ver AdminPage), por eso van también.
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/styles/critical.scss',
        './src/features/*/pages/*.jsx',
        './src/features/admin/components/Admin*Section.jsx',
      ],
    },
  },
})
