# Font Loading Drift Example

## Input

A customer says text spacing changed in Chromatic but the component code did not. They share one diff screenshot showing fallback fonts and confirm the same story looks correct after fonts fully load locally.

## Expected use of the skill

- classify as `VD_FONT_LOADING_DRIFT`
- explain that the diff is consistent with a font-loading mismatch rather than a component regression
- recommend one narrow next step such as validating font preload or the shared preview setup
- avoid defaulting to `diffThreshold`
