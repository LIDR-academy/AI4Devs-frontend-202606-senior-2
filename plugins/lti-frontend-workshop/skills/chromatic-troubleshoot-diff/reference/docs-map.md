# Documentation Source Map

Use the local source pack in `reference/source-pack/` after classification so recommendations are grounded in Chromatic's visual-testing docs.

| Diagnosis code | Start with | Then consult | Why |
| --- | --- | --- | --- |
| `VD_EXPECTED_UI_CHANGE` | none | `reference/source-pack/troubleshooting-snapshots.txt` only if the user is unsure the diff is real | expected diffs usually need review workflow guidance, not remediation |
| `VD_LOCAL_RENDER_DRIFT` | none | `reference/source-pack/troubleshooting-snapshots.txt` if the local cause is still unclear | the root cause is already in the story or component before Chromatic capture |
| `VD_FONT_LOADING_DRIFT` | `reference/source-pack/font-loading.txt` | `reference/source-pack/troubleshooting-snapshots.txt` | preload, static font files, and font-loading checks are the primary fix paths |
| `VD_ASYNC_LOADING_TIMING` | `reference/source-pack/resource-loading.txt` | `reference/source-pack/delay.txt`, then `reference/source-pack/troubleshooting-snapshots.txt` | async rendering and delayed resources often need either deterministic assertions or delay as a fallback |
| `VD_ANIMATION_OR_TRANSITION_STATE` | `reference/source-pack/animations.txt` | `reference/source-pack/delay.txt` | prefer disabling or controlling motion before using delay or ignores |
| `VD_NONDETERMINISTIC_DATA` | `reference/source-pack/troubleshooting-snapshots.txt` | none | the troubleshooting guide covers randomness, current time, and inconsistency patterns |
| `VD_VIEWPORT_OR_GLOBALS_MISMATCH` | `reference/source-pack/viewports.txt` | `reference/source-pack/troubleshooting-snapshots.txt` | modes, globals, default viewport behavior, and screenshot metadata explain these diffs |
| `VD_POSITION_STICKY_OR_FIXED` | `reference/source-pack/position-sticky.txt` | `reference/source-pack/troubleshooting-snapshots.txt` | sticky/fixed capture behavior depends on initial positioning and wrapper layout |
| `VD_EXTERNAL_ASSET_VARIATION` | `reference/source-pack/resource-loading.txt` | `reference/source-pack/troubleshooting-snapshots.txt` | remote assets, retries, static serving, and trace-viewer network checks apply directly |
| `VD_NEEDS_MORE_EVIDENCE` | `reference/source-pack/troubleshooting-snapshots.txt` | none | rerun builds, traces, and screenshot metadata are the best next debugging surface |
