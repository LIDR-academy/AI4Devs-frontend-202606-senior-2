# Visual Diff Diagnosis Taxonomy

Use one primary code per response.

| Code | Meaning | Typical evidence |
| --- | --- | --- |
| `VD_EXPECTED_UI_CHANGE` | The snapshot changed because the component, story, or approved review surface intentionally changed. | recent code or design change, same output locally and in Chromatic |
| `VD_LOCAL_RENDER_DRIFT` | The same visual issue is already present in local Storybook, so the root cause is not Chromatic-specific. | local Storybook reproduces the issue, component or story bug visible before upload |
| `VD_FONT_LOADING_DRIFT` | Fonts are missing, late-loading, or resolved differently between environments. | fallback fonts, spacing shifts, custom font setup, asset or network timing clues |
| `VD_ASYNC_LOADING_TIMING` | The snapshot is captured before async UI, assets, or data settle. | loading state captured, intermittent completion, missing late content |
| `VD_ANIMATION_OR_TRANSITION_STATE` | Motion or transition state changes the captured frame. | partial animation, hover state drift, transitions or keyframes in the affected surface |
| `VD_NONDETERMINISTIC_DATA` | The rendered output changes because the story or component uses unstable data or time-based values. | dates, random values, generated IDs, avatars, timestamps, locale-sensitive output |
| `VD_VIEWPORT_OR_GLOBALS_MISMATCH` | The diff is caused by viewport, theme, locale, or other global configuration differences. | different modes, globals, decorators, preview parameters, responsive layout shift |
| `VD_POSITION_STICKY_OR_FIXED` | Sticky or fixed positioning behaves differently in capture because the rendered layout or wrapper context is different from what the story expects. | sticky footer pinned incorrectly, fixed element blank or missing, parent grid/flex layout affecting sticky behavior |
| `VD_EXTERNAL_ASSET_VARIATION` | Remote images, CDN assets, or third-party embeds render differently between runs. | remote image drift, blocked or changing external assets, environment-sensitive embeds |
| `VD_NEEDS_MORE_EVIDENCE` | The current evidence is not enough to choose one branch confidently. | missing build reference, no screenshot, no local reproduction signal |

## Priority rule

If more than one code appears plausible, prefer the earliest confirmed rendering cause in the chain.
