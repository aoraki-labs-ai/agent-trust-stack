#!/usr/bin/env node
/** Lists claims past their review_by date, as GitHub-flavoured markdown. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const now = new Date();
const stale = [];
const owing = [];

for (const file of readdirSync('data/claims').filter((f) => f.endsWith('.yml'))) {
  const c = parse(readFileSync(join('data/claims', file), 'utf8'));
  if (c.review_by && new Date(c.review_by) < now)
    stale.push({ ...c, file, due: String(c.review_by).slice(0, 10) });
  if (c.needs_primary_source) owing.push({ ...c, file });
}

if (!stale.length && !owing.length) {
  console.log('No claims are past their review date, and none owe a source.');
  process.exit(0);
}

if (stale.length) {
  console.log(`## ${stale.length} claim(s) past their review date\n`);
  for (const c of stale)
    console.log(
      `- [ ] \`${c.id}\` (due ${c.due}) — ${c.statement.en}\n      <br>Falsifier: ${c.falsifier.en}`
    );
  console.log('');
}
if (owing.length) {
  console.log(`## ${owing.length} claim(s) still owing a primary source\n`);
  for (const c of owing) console.log(`- [ ] \`${c.id}\` — ${c.statement.en}`);
  console.log(
    '\nThese are withheld from `claims.json` until sourced. If a source cannot be found, delete the claim rather than soften it.'
  );
}
