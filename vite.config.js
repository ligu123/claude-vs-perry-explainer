import { defineConfig } from 'vite';

// Set BASE_PATH when previewing a GitHub Pages subpath locally, e.g.:
// BASE_PATH=/claude-vs-perry-explainer/ npm run preview
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  server: {
    open: true,
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
