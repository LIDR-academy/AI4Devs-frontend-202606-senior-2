# Visual Diff Workflow Playbook

Use this workflow to move from symptom to the smallest stabilizing action.

## Default path

1. identify the affected story and current rendering symptom
2. decide whether the issue reproduces locally
3. classify the most likely rendering cause
4. read the matching local source file(s) under `reference/source-pack/`
5. ask for one exact artifact or run one targeted repo probe if needed
6. return the diagnosis card with one verification step

## Phase A: Triage

Look for the fastest branch-cutting facts:
- did the UI intentionally change?
- does local Storybook show the same problem?
- is the issue story-local or shared through preview, decorators, globals, assets, or layout wrappers?
- does the build already show rerun inconsistency or trace-viewer evidence?

## Phase B: Source-backed branch selection

Prefer these branches in order:
- expected change
- local rendering drift
- font loading
- resource loading or async rendering
- animations or transitions
- viewport or globals mismatch
- sticky or fixed positioning
- unstable data or time-based rendering
- troubleshooting escalation

## Phase C: Load the matching source notes

Read the smallest relevant local source file(s) from `reference/source-pack/` before recommending a fix:
- font issues: `font-loading.txt`
- assets or delayed rendering: `resource-loading.txt`, then `delay.txt` if timing is the real bottleneck
- motion: `animations.txt`
- viewport or globals: `viewports.txt`
- sticky or fixed layout behavior: `position-sticky.txt`
- inconsistent or still-ambiguous builds: `troubleshooting-snapshots.txt`

## Phase D: Targeted validation

If the repo is available, inspect:
- the affected story
- `.storybook/preview.*`
- `.storybook/preview-head.html`
- shared decorators, globals, and mode parameters
- `staticDirs`, `assetDomains`, and remote asset usage
- obvious font, animation, fixed or sticky, and random-data sources

## Phase E: Recommendation

Return the narrowest fix that matches the evidence.

If the evidence is incomplete, ask for one exact artifact instead of proposing a broad stabilization checklist.

Use `troubleshooting-snapshots.txt` when:
- the issue changes between reruns
- you need trace-viewer guidance
- the best next step is inspecting network requests, DOM snapshots, or screenshot metadata instead of changing code immediately
