import type { APIRoute } from 'astro';
import { allClaims } from '../../lib/claims';

/**
 * The claims database as JSON, for agents and for anyone re-checking our
 * numbers. Claims that still owe a primary source are withheld: publishing an
 * unsourced number through a machine API is how bad figures get laundered.
 */
export const GET: APIRoute = () => {
  const claims = [...allClaims().values()].filter((c) => !c.needs_primary_source);
  const withheld = [...allClaims().values()]
    .filter((c) => c.needs_primary_source)
    .map((c) => c.id);

  return new Response(
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        count: claims.length,
        withheld_pending_source: withheld,
        claims,
      },
      null,
      2
    ),
    { headers: { 'content-type': 'application/json; charset=utf-8' } }
  );
};
