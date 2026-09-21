#!/usr/bin/env node
/**
 * Pre-build gate. Fails loudly rather than shipping a number nobody can check.
 * Run: npm run validate
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const DIR = 'data/claims';
const DATA_DIR = 'data';
const errors = [];
const warnings = [];
const ids = new Set();

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.yml'))) {
  const path = join(DIR, file);
  let claim;
  try {
    claim = parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path}: unparseable YAML — ${e.message}`);
    continue;
  }

  const need = (field) => {
    if (claim[field] === undefined || claim[field] === null)
      errors.push(`${path}: missing required field "${field}"`);
  };
  ['id', 'kind', 'statement', 'tier', 'falsifier', 'review_by'].forEach(need);

  if (claim.id && claim.id !== file.replace(/\.yml$/, ''))
    errors.push(`${path}: id "${claim.id}" does not match filename`);
  if (claim.id && ids.has(claim.id)) errors.push(`${path}: duplicate id`);
  ids.add(claim.id);

  for (const key of ['statement', 'falsifier']) {
    const v = claim[key];
    if (v && (!v.zh || !v.en))
      errors.push(`${path}: "${key}" must carry both zh and en`);
  }

  const sources = claim.sources ?? [];
  if (sources.length === 0 && !claim.needs_primary_source)
    errors.push(
      `${path}: no sources, and not flagged needs_primary_source. Every number carries its receipt.`
    );
  for (const s of sources) {
    for (const f of ['url', 'title', 'publisher', 'type', 'accessed'])
      if (!s[f]) errors.push(`${path}: source missing "${f}"`);
    if (s.url && !/^https?:\/\//.test(s.url))
      errors.push(`${path}: source url is not absolute — ${s.url}`);
    if (!s.archived)
      warnings.push(`${path}: source not archived yet — ${s.url}`);
  }

  if (claim.review_by && new Date(claim.review_by) < new Date())
    warnings.push(
      `${path}: past its review_by date (${claim.review_by}) — re-check the number`
    );
  if (claim.needs_primary_source)
    warnings.push(`${path}: still owes a primary source (withheld from claims.json)`);
}

// Every dataset the site renders must parse too. An unquoted value containing
// ": " is valid-looking YAML that fails only at render time — catch it here.
for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml'))) {
  const path = join(DATA_DIR, file);
  try {
    parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path}: unparseable YAML — ${e.message.split('\n')[0]}`);
  }
}

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
console.log(
  `\n${ids.size} claims checked · ${errors.length} errors · ${warnings.length} warnings`
);
process.exit(errors.length ? 1 : 0);
