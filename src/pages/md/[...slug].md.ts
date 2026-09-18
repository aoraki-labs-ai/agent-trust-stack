import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * A plain-markdown twin of every chapter, at /md/<slug>.md — no navigation,
 * no styling, nothing for a reader (human or machine) to strip out.
 * Drafts are served but carry a loud header, so nobody quotes one by accident.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({ params: { slug: doc.id }, props: { doc } }));
};

export const GET: APIRoute = ({ props }) => {
  const doc = (props as any).doc;
  const status = doc.data.status ?? 'draft';
  const header = [
    `# ${doc.data.title}`,
    '',
    doc.data.description ? `> ${doc.data.description}` : '',
    '',
    `status: ${status}`,
    status !== 'approved'
      ? 'NOT SIGNED OFF — numbers and conclusions may still change. Do not cite.'
      : `signed off by ${doc.data.reviewedBy ?? 'unknown'}`,
    '',
    '---',
    '',
  ].join('\n');

  return new Response(header + (doc.body ?? ''), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
};
