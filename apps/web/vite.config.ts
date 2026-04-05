import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  plugins: [tsConfigPaths(), tanstackStart(), nitro(), viteReact(), tailwindcss()]
});
