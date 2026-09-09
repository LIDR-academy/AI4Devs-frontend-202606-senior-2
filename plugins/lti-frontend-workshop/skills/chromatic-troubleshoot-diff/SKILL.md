---
name: chromatic-troubleshoot-diff
description: Diagnose unexpected Chromatic visual diffs, snapshot inconsistencies, font and resource loading drift, animation timing issues, viewport or globals mismatches, sticky or fixed positioning quirks, and nondeterministic story output. Use when snapshots change unexpectedly or the same code produces inconsistent diffs and you need the narrowest next step to stabilize the snapshot.
metadata:
  short-description: Troubleshoot Chromatic visual diffs
---

# Troubleshoot Diff

Diagnose why a Chromatic snapshot changed and identify the narrowest stabilizing fix.

## Required workflow

1. Start with current evidence. Prefer the build URL or build number, affected story, screenshot or diff description, local Storybook repro signal, active Chromatic params or globals, and any recent changes to fonts, assets, animations, viewports, decorators, or shared preview code. If the issue already points to a likely branch, do not ask for a broad repo dump.
2. Classify the issue using `reference/diagnosis-taxonomy.md`. Use `reference/workflow-playbook.md` when the branch is unclear. Prioritize local rendering problems before Chromatic-only theories, and treat intentional UI changes as expected diffs rather than stabilization work.
3. Read the mapped local source notes from `reference/docs-map.md` and `reference/source-pack/README.md`. Ground the fix path in those notes when they clearly apply.
4. Inspect the repo before asking for more data when the repo is available. Use `reference/command-catalog.md`; check the story, `.storybook/preview.*`, `.storybook/preview-head.html`, and relevant asset, mode, animation, and layout surfaces. If Playwright is available and helps settle the branch, reproduce there too.
5. If still blocked, ask for one exact artifact using `reference/evidence-ladder.md`. Prefer rerun-build or trace-viewer evidence when the issue is inconsistent across runs.
6. Return the diagnosis card from `reference/output-contract.md`. If confidence is still low, name the most likely diagnosis, say why confidence is limited, and request one exact next artifact or repo check.

## Boundaries

- Ask for one artifact at a time.
- Do not recommend `diffThreshold`, snapshot ignores, or broad suppression as the first response to unexplained diffs.
- Do not claim Chromatic is the root cause when the same issue is already visible in local Storybook.
- Use the local source pack when it clearly applies instead of giving generic advice.
- Do not ask for the entire repository, all screenshots, or long CI logs when one story-level artifact would settle the branch.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/docs-map.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/source-pack/README.md`
- `template.md`
- `evaluations/README.md`
