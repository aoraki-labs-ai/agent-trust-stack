// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const SITE = process.env.SITE_URL ?? 'https://aoraki-labs-ai.github.io';
const BASE = process.env.SITE_BASE ?? '/agent-trust-stack';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: {
        'zh-CN': 'Agent 信任栈',
        en: 'Agent Trust Stack',
      },
      description:
        'A living, source-linked report on trustworthy-privacy and verifiable AI for the agent era.',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/aoraki-labs-ai/agent-trust-stack',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/aoraki-labs-ai/agent-trust-stack/edit/main/',
      },
      lastUpdated: true,
      customCss: ['./src/styles/custom.css'],
      components: {
        // Injects the draft / in-review banner above every page body.
        PageTitle: './src/components/PageTitle.astro',
        // Holds back search engines until a chapter is signed off.
        Head: './src/components/Head.astro',
      },
      sidebar: [
        {
          label: '导读',
          translations: { en: 'Front matter' },
          items: [
            { label: '00 · 方法论与读法', slug: '00-method', translations: { en: '00 · Method and how to read this' } },
          ],
        },
        {
          label: '正文',
          translations: { en: 'Chapters' },
          badge: { text: '规划中', variant: 'caution' },
          items: [],
        },
      ],
    }),
  ],
});
