# Contributing

## The one rule

**Every number carries its receipt.** A figure without a source URL, a source tier, a confidence
tier and a stated falsifier will not pass the build. This is enforced by `scripts/validate-claims.mjs`,
not by reviewer memory.

## Adding a fact

Facts are files, not sentences. Create `data/claims/<kebab-id>.yml`:

```yaml
id: kebab-id                    # must match the filename
kind: quantity                  # quantity | event | status
statement:
  zh: 中文陈述，一句话，不用形容词
  en: One sentence, no adjectives
value: { low: 100, high: 10000, unit: "x", metric: prove-time-vs-plaintext }
tier: literature                # measured | reproducible | literature | inference
sources:
  - url: https://...
    title: Exact title of the page or paper
    publisher: Who published it
    type: secondary             # primary | secondary | vendor | analyst
    accessed: 2026-09-17
falsifier:
  zh: 什么样的可执行观测会推翻它
  en: Which executable observation would overturn this
review_by: 2027-03-01           # when this number must be re-checked
```

Then reference it in prose as `<Claim id="kebab-id" />`. Never retype the number into a sentence —
that is how prose and charts start disagreeing.

### Tier discipline

- `measured` means **we** ran it, and the chapter names the machine, the environment version and
  the configuration. If you cannot name the machine, it is not `measured`.
- `inference` is a judgement. It renders with a distinct badge and must never be presented as a
  measurement, in the prose or in a paraphrase.
- `analyst` market-size figures from different houses differ by up to an order of magnitude.
  Present them side by side; **never average across them**.

### A claim with no source

Only legal with `needs_primary_source: true`. It will render with a visible marker and be withheld
from `claims.json`. This state is a debt to be paid, not a resting place — if a source cannot be
found, delete the claim rather than soften its wording.

## Writing a chapter

1. **Build up to conclusions.** Test: delete the concluding sentence; a reader should be able to
   derive it from what came before.
2. **Open with the terms.** Explain a term where it first appears; do not assume the reader has
   read any other chapter.
3. **State what would kill it.** Each chapter ends with a falsification section naming executable
   observations and where to make them.
4. **Both languages.** Chinese is the source; English is a full translation, not a summary. A
   chapter missing its counterpart raises a warning.
5. **Charts read the database.** A chart must not carry its own copy of a number.

## Chapter states and sign-off

`draft` → `in-review` → `approved`. Only `approved` chapters reach `llms.txt` and `claims.json`.
An `approved` chapter must name its reviewer and carry a falsification section. Editing an approved
chapter's body in a pull request fails CI until the status is reset — the sign-off has to describe
the version that was actually read.

## What will be rejected

- A number whose only source is a vendor page, presented as fact rather than tagged `vendor`.
- An averaged market-size figure.
- A conclusion without a falsifier.
- Promotional language about any company, including the maintainer's. `scripts/lint-content.mjs`
  blocks the obvious cases; reviewers catch the rest.

## Conflicts of interest

If you work for, advise, or hold equity in a company you are writing about, say so in the pull
request. It does not disqualify the contribution; concealing it does.
