# Agent Trust Stack · Agent 信任栈

A living, source-linked report on **trustworthy privacy and verifiable AI for the agent era**:
where trust breaks when the actor doing the computing stops being a person, who is patching it,
how well, and for how much money.

一份持续更新、逐条标注来源的报告：当计算的主体从人变成 agent，信任在哪里断了，谁在补，多少钱。

**Site:** https://aoraki-labs-ai.github.io/agent-trust-stack/ · 中文为源语言，English is a full
translation (not a summary).

---

## Disclosure / 利益披露

Maintained by **Aoraki Labs**, who hold commercial interests in ZK proving and trusted hardware.
Every judgement in this report is tagged `inference` and ships with the observation that would
overturn it. Run those checks rather than taking our word for it.

本报告由 Aoraki Labs 维护，维护方在 ZK 证明与可信硬件领域有商业利益。所有判断均标注为「推断」
并附证伪条件，请优先自行检验。

---

## What makes this different

**1 · Facts live apart from prose.** Every checkable number is a record in `data/claims/*.yml`
carrying a source URL, a source tier, a confidence tier, an access date, a stated falsifier and a
re-check date. Prose and charts read the same record, so they cannot drift apart. A number without
a source fails the build.

**2 · Every conclusion ships with the method for killing it.** Not "needs further validation", but
"this specific observation would overturn it, and here is where to make it".

**3 · Machine interfaces are first-class**, not an afterthought:

| Entry point | Contents |
|---|---|
| `/llms.txt` | Index, **signed-off chapters only** |
| `/llms-full.txt` | Flattened full text |
| `/api/claims.json` | Every fact record; claims still owing a primary source are withheld |
| `/md/<slug>.md` | That chapter as plain markdown |
| `mcp/` | MCP server: `search_claims`, `get_claim`, `list_falsifiers`, `whats_changed` |

---

## Repository layout

```
data/claims/*.yml        one file per checkable fact — the spine of the repo
src/content/docs/        chapters; Chinese at the root, English under en/
src/components/          Claim renderer, review banner, chart islands
src/lib/claims.ts        claim schema and loader (Zod, validated at build)
scripts/validate-claims  every number has a source, a tier and a falsifier
scripts/lint-content     chapter rules; also blocks re-coupling to our products
scripts/check-review-*   "approved" must describe the version actually read
```

## Working on it

```bash
npm install
npm run check      # claim + chapter gates, no build
npm run dev        # local preview
npm run build      # gates, then static output to dist/
```

Output is static; it deploys to GitHub Pages with no server.

## Chapter states

Each chapter carries `status: draft | in-review | approved`. Only `approved` chapters reach
`llms.txt` and the JSON export. CI fails a pull request that edits an approved chapter's body
without resetting its status, so the sign-off always describes the exact version someone read.

## Contributing

The most valuable contribution is a **refutation**. Every chapter ends with the observations that
would overturn its conclusions — if you make one, open an issue, including when the result supports
us. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Content — including the claims database — is [CC BY 4.0](LICENSE).
Code is [MIT](LICENSE-CODE).

Cite a dated quarterly snapshot (e.g. `2026Q4`) rather than `main`, so what you cited does not
change underneath you.
