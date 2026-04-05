import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://docs.crawlmark.report',
  integrations: [
    starlight({
      title: 'Crawlmark Docs',
      description: 'Authoritative reference for Crawlmark scanning criteria, scoring, and checks.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Introduction',
          link: '/',
        },
        {
          label: 'Scoring',
          items: [
            { label: 'Overview', link: '/scores/overview/' },
            { label: 'Open Score', link: '/scores/open-score/' },
            { label: 'Blocking Score', link: '/scores/blocking-score/' },
          ],
        },
        {
          label: 'Checks',
          items: [
            { label: 'Layer 1 - Crawl Access', link: '/checks/layer-1/' },
            { label: 'Layer 2 - Renderability', link: '/checks/layer-2/' },
            { label: 'Layer 3 - Structured Data', link: '/checks/layer-3/' },
            { label: 'Layer 4 - Advanced', link: '/checks/layer-4/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Check Statuses', link: '/reference/check-statuses/' },
            { label: 'URL Resolution', link: '/reference/url-resolution/' },
            { label: 'Execution Order', link: '/reference/execution-order/' },
          ],
        },
      ],
    }),
    sitemap(),
  ],
});
