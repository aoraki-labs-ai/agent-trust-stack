#!/usr/bin/env node
/**
 * House rules for chapters, enforced at build time rather than by memory.
 *  1. Every chapter exists in both languages.
 *  2. A chapter marked `approved` must name who signed it off.
 *  3. A chapter marked `approved` must carry a falsification section.
 *  4. No chapter may re-couple the report to the maintainer's own products.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src/content/docs';
const errors = [];
const warnings = [];

/** Words that would undo the content-level decoupling. */
const FORBIDDEN = [
  { re: /fidcore/i, why: 'names the maintainer’s product' },
  { re: /我们的产品|我们正在做/, why: 'first-person business voice' },
  { re: /建议你(?:先|立刻|马上)/, why: 'first-person advice to a specific reader' },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.mdx?$/.test(p)) out.push(p);
  }
  return out;
}

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '');
  }
  return fm;
}

const files = walk(ROOT);
const byLang = { zh: new Set(), en: new Set() };

for (const file of files) {
  const rel = relative(ROOT, file);
  const lang = rel.startsWith('en/') ? 'en' : 'zh';
  const slug = rel.replace(/^en\//, '').replace(/\.mdx?$/, '');
  byLang[lang].add(slug);

  const src = readFileSync(file, 'utf8');
  const fm = frontmatter(src);
  if (!fm) {
    errors.push(`${file}: no frontmatter`);
    continue;
  }
  const status = fm.status ?? 'draft';
  if (!['draft', 'in-review', 'approved'].includes(status))
    errors.push(`${file}: unknown status "${status}"`);

  if (status === 'approved') {
    if (!fm.reviewedBy)
      errors.push(`${file}: status is approved but reviewedBy is empty`);
    const hasFalsify = /class="falsify"|##\s*(怎么证伪|How to falsify)/.test(src);
    if (!hasFalsify)
      errors.push(
        `${file}: approved chapters must state what would overturn their conclusions`
      );
  }

  for (const { re, why } of FORBIDDEN) {
    const hit = src.match(re);
    if (hit) errors.push(`${file}: contains "${hit[0]}" — ${why}`);
  }
}

for (const slug of byLang.zh) {
  if (!byLang.en.has(slug))
    warnings.push(`${slug}: Chinese chapter has no English counterpart yet`);
}
for (const slug of byLang.en) {
  if (!byLang.zh.has(slug))
    warnings.push(`${slug}: English chapter has no Chinese source yet`);
}

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
console.log(
  `\n${files.length} chapter files checked · ${errors.length} errors · ${warnings.length} warnings`
);
process.exit(errors.length ? 1 : 0);
