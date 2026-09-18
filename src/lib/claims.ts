import { parse } from 'yaml';
import { z } from 'astro:content';

/**
 * YAML is inlined by Vite at build time rather than read from disk, so the
 * claims survive bundling into dist/ during prerender.
 */
const CLAIM_FILES = import.meta.glob('../../data/claims/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** How much weight a source carries. Rendered as a visible badge. */
export const sourceType = z.enum(['primary', 'secondary', 'vendor', 'analyst']);

/** How much weight the claim itself carries. */
export const confidenceTier = z.enum([
  'measured', // we ran it ourselves, with machine and config named
  'reproducible', // a formula or script the reader can re-run
  'literature', // someone else's published number
  'inference', // our judgement, not a measurement
]);

const bilingual = z.object({ zh: z.string(), en: z.string() });

export const sourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  publisher: z.string(),
  type: sourceType,
  accessed: z.coerce.date(),
  /** web.archive.org snapshot, filled in by scripts/archive-sources.mjs */
  archived: z.string().url().optional(),
});

export const claimSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    kind: z.enum(['quantity', 'event', 'status']),
    statement: bilingual,
    value: z.any().optional(),
    /** Short inline form, e.g. "100-10,000x". Derived when absent. */
    display: bilingual.optional(),
    tier: confidenceTier,
    sources: z.array(sourceSchema),
    /** What observation would overturn this. Required — no exceptions. */
    falsifier: bilingual,
    review_by: z.coerce.date(),
    needs_primary_source: z.boolean().default(false),
    notes: bilingual.optional(),
    supersedes: z.string().optional(),
    superseded_by: z.string().optional(),
  })
  .superRefine((claim, ctx) => {
    // A claim with no source is only legal while it is explicitly flagged as
    // owing one. Anything else is a build failure.
    if (claim.sources.length === 0 && !claim.needs_primary_source) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `claim "${claim.id}" has no sources and is not flagged needs_primary_source`,
      });
    }
    // Inference is our own judgement; it must never wear a source badge that
    // makes it look measured.
    if (claim.tier === 'measured' && claim.sources.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `claim "${claim.id}" is tier "measured" but names no source`,
      });
    }
  });

export type Claim = z.infer<typeof claimSchema>;

let cache: Map<string, Claim> | null = null;

export function allClaims(): Map<string, Claim> {
  if (cache) return cache;
  const map = new Map<string, Claim>();
  for (const [path, source] of Object.entries(CLAIM_FILES)) {
    const file = path.split('/').pop()!;
    const raw = parse(source);
    const parsed = claimSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Invalid claim in data/claims/${file}:\n${parsed.error.issues
          .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
          .join('\n')}`
      );
    }
    if (parsed.data.id !== file.replace(/\.yml$/, '')) {
      throw new Error(
        `Claim id "${parsed.data.id}" does not match filename ${file}`
      );
    }
    map.set(parsed.data.id, parsed.data);
  }
  cache = map;
  return map;
}

export function getClaim(id: string): Claim {
  const claim = allClaims().get(id);
  if (!claim) {
    throw new Error(
      `Unknown claim id "${id}". Known ids: ${[...allClaims().keys()].join(', ')}`
    );
  }
  return claim;
}

/** Claims whose facts are past their re-check date. */
export function staleClaims(now = new Date()): Claim[] {
  return [...allClaims().values()].filter((c) => c.review_by < now);
}

/** Claims that still owe a primary source — excluded from public exports. */
export function unsourcedClaims(): Claim[] {
  return [...allClaims().values()].filter((c) => c.needs_primary_source);
}
