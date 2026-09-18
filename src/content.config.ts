import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

/**
 * Every chapter carries an explicit review state. Nothing reaches the
 * machine-readable exports (llms.txt, claims.json) until it is `approved`.
 */
export const reviewStatus = z.enum(['draft', 'in-review', 'approved']);

export const collections = {
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** Review state. Defaults to draft so nothing ships by accident. */
        status: reviewStatus.default('draft'),
        /** Who signed the chapter off, and when. */
        reviewedBy: z.string().optional(),
        reviewedAt: z.coerce.date().optional(),
        /** Date the chapter's facts were last walked through end to end. */
        lastReviewed: z.coerce.date().optional(),
        /** Claim IDs this chapter depends on; checked against data/claims. */
        claims: z.array(z.string()).default([]),
        /** Chapter number, used for ordering and citation. */
        chapter: z.string().optional(),
      }),
    }),
  }),
};
