import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://loc747.github.io',
  base: '/Mono',
  integrations: [sitemap({ filter: (page) => !/\/(admin|login|signup|profile|reset)\//.test(page) })],
  vite: { plugins: [tailwindcss()] },
});
