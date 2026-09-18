#!/usr/bin/env node
/**
 * "Approved" must mean "somebody read this exact version". If a pull request
 * changes a chapter's body while leaving status: approved in place, fail —
 * the sign-off no longer describes what is on the page.
 *
 * Usage: node scripts/check-review-status.mjs <base-ref>
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'origin/main';
const changed = execSync(`git diff --name-only ${base}...HEAD -- src/content/docs`)
  .toString()
  .split('\n')
  .filter((f) => /\.mdx?$/.test(f));

const offenders = [];
for (const file of changed) {
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    continue; // deleted
  }
  if (!/^status:\s*approved\s*$/m.test(src)) continue;

  // Did only the frontmatter move, or the body too?
  const diff = execSync(`git diff ${base}...HEAD -- ${file}`).toString();
  const bodyTouched = diff
    .split('\n')
    .filter((l) => /^[+-][^+-]/.test(l))
    .some((l) => !/^[+-]\s*(status|reviewedBy|reviewedAt|lastReviewed):/.test(l));

  if (bodyTouched) offenders.push(file);
}

if (offenders.length) {
  console.error(
    'These chapters changed while still marked approved. Set status back to ' +
      '`in-review` and have them signed off again:\n' +
      offenders.map((f) => `  - ${f}`).join('\n')
  );
  process.exit(1);
}
console.log(`Review status consistent across ${changed.length} changed chapter file(s).`);
