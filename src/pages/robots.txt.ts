import type { APIRoute } from 'astro';

/**
 * Closed to crawlers until the report is launched. Flip by setting
 * SITE_INDEXABLE=1 in the deploy workflow — no code change needed.
 */
export const GET: APIRoute = ({ site }) => {
  const indexable = process.env.SITE_INDEXABLE === '1';
  const sitemap = new URL(
    `${import.meta.env.BASE_URL}/sitemap-index.xml`.replace(/\/+/g, '/'),
    site
  ).href;

  const body = indexable
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`].join('\n')
    : [
        '# Pre-launch. Chapters are unreviewed and must not be indexed or quoted.',
        'User-agent: *',
        'Disallow: /',
      ].join('\n');

  return new Response(body + '\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
