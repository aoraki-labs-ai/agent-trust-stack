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
          items: [
            { label: '01 · 术语表', slug: '01-glossary', translations: { en: '01 · Glossary' } },
            { label: '02 · 需求侧：六个信任缺口', slug: '02-demand', translations: { en: '02 · Demand: the six trust gaps' } },
            { label: '03 · 四条路线的真实代价', slug: '03-cost', translations: { en: '03 · What each route really costs' } },
            { label: '04 · 技术栈全景 L0–L4', slug: '04-stack', translations: { en: '04 · The stack, L0 to L4' } },
            { label: '05 · 生态地图：六个阵营', slug: '05-ecosystem', translations: { en: '05 · Ecosystem: six camps' } },
            { label: '06 · 成熟度 × 付费驱动', slug: '06-positioning', translations: { en: '06 · Maturity against willingness to pay' } },
            { label: '07 · 三盆冷水', slug: '07-cold-water', translations: { en: '07 · Three buckets of cold water' } },
            { label: '08 · 开放问题与证伪清单', slug: '08-open-questions', translations: { en: '08 · Open questions and the falsification list' } },
          ],
        },
      ],
    }),
  ],
});
