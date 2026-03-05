import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/',
    server: {
        port: 3002,
    },
    plugins: [
        tsConfigPaths(),
        tanstackStart(),
        nitro(),
        viteReact(),
        tailwindcss(),
    ],
})
