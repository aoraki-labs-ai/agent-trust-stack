import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { allClaims } from '../lib/claims';

/**
 * Index for language models, per the llms.txt convention. Only chapters that
 * have been signed off appear: a draft is not something an agent should quote.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site).href.replace(/\/$/, '');
  const docs = await getCollection('docs');
  const approved = docs.filter((d) => (d.data as any).status === 'approved');
  const drafts = docs.length - approved.length;

  const lines = [
    '# Agent Trust Stack',
    '',
    '> A living, source-linked report on trustworthy-privacy and verifiable AI for',
    '> the agent era. Every number carries a source, a confidence tier and a stated',
    '> falsifier. Maintained by Aoraki Labs, who hold commercial interests in ZK',
    '> proving and trusted hardware — weigh the judgement calls accordingly.',
    '',
    `Full text: ${base}/llms-full.txt`,
    `Claims database: ${base}/api/claims.json`,
    `Raw markdown twin of any chapter: ${base}/md/<slug>.md`,
    '',
    '## Chapters',
    ...approved.map((d) => `- [${d.data.title}](${base}/${d.id}/): ${d.data.description ?? ''}`),
    '',
    '## Notes for machine readers',
    `- ${approved.length} chapters signed off; ${drafts} still in draft and deliberately omitted here.`,
    `- ${allClaims().size} claims in the database; those still owing a primary source are withheld from the JSON export.`,
    '- Confidence tiers: measured | reproducible | literature | inference. Never present an `inference` tier claim as a measurement.',
    '- Source tiers: primary | secondary | vendor | analyst. Analyst market-size figures diverge by an order of magnitude between houses; do not average them.',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
