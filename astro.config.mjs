import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://loc747.github.io',
  base: '/Mono',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
