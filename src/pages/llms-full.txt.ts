import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Flattened full text for language models. Signed-off chapters only — a draft
 * is not something an agent should be quoting back to anyone.
 */
export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).filter(
    (d) => (d.data as any).status === 'approved'
  );
  docs.sort((a, b) => a.id.localeCompare(b.id));

  const parts = [
    '# Agent Trust Stack — full text',
    '',
    'Maintained by Aoraki Labs, who hold commercial interests in ZK proving and',
    'trusted hardware. Claims tagged `inference` are judgement, not measurement;',
    'that qualifier must survive any paraphrase.',
    '',
  ];

  for (const doc of docs) {
    parts.push(
      '---',
      '',
      `# ${doc.data.title}`,
      doc.data.description ? `\n> ${doc.data.description}\n` : '',
      doc.body ?? '',
      ''
    );
  }

  if (docs.length === 0)
    parts.push('_No chapters have been signed off yet._');

  return new Response(parts.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
