import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localizedSeo } from './scripts/seo.ts';

export default defineConfig({
  plugins: [localizedSeo(), react(), tailwindcss()],
});
