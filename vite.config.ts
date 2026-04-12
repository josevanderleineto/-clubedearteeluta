import { defineConfig } from 'vite';
import { generateCmsConfig } from './scripts/generate-cms-config.mjs';

export default defineConfig({
  plugins: [
    {
      name: 'generate-cms-config',
      async configResolved() {
        await generateCmsConfig();
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        hapkido: 'hapkido.html',
      },
    },
  },
});
