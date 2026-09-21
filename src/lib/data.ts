import { parse } from 'yaml';

const FILES = import.meta.glob('../../data/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Reads data/<name>.yml. Throws loudly rather than rendering an empty figure. */
export function dataset<T = unknown>(name: string): T {
  const key = Object.keys(FILES).find((p) => p.endsWith(`/${name}.yml`));
  if (!key) throw new Error(`No data/${name}.yml. Found: ${Object.keys(FILES).join(', ')}`);
  return parse(FILES[key]) as T;
}

/** Fields that carry both languages resolve against the page's locale. */
export type Bi = string | { zh: string; en: string };
export const t = (v: Bi, lang: 'zh' | 'en'): string =>
  typeof v === 'string' ? v : v[lang];

export const FAMILY_COLOR: Record<string, string> = {
  hardware: 'var(--series-1)',
  crypto: 'var(--series-2)',
  protocol: 'var(--series-3)',
};
export const FAMILY_LABEL: Record<string, { zh: string; en: string }> = {
  hardware: { zh: '硬件信任根', en: 'Hardware root of trust' },
  crypto: { zh: '密码学', en: 'Cryptography' },
  protocol: { zh: '协议与治理', en: 'Protocol and governance' },
};
