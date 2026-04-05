import tailwindcss from '@tailwindcss/vite';
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    nitroV2Plugin({
      preset: 'vercel',
      compatibilityDate: '2026-04-05', // fixes the WARN too
      esbuild: {
        options: {
          target: 'node20' // ← key fix
        }
      }
    })
  ]
});
