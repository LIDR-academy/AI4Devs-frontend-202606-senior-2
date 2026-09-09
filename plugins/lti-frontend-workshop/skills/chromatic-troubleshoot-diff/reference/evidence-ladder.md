# Visual Diff Evidence Ladder

Ask for the smallest artifact that settles the next branch.

## High-value evidence already in hand

- build URL or build number
- exact story name or story ID
- one screenshot or diff description
- whether local Storybook reproduces the issue
- the affected story snippet or shared preview parameters
- a recent note about fonts, assets, timing, or decorator changes

## Best next artifacts

1. exact build URL or build number
2. one screenshot or diff link for the affected story
3. confirmation whether the issue reproduces in local Storybook
4. the relevant story file or `.storybook/preview.*` snippet
5. one console or network error if remote assets are suspected

## Things to avoid asking for first

- the whole repository
- every changed file in the branch
- all CI logs
- multiple screenshots from unrelated stories
- broad requests for “all config files” when one story and one preview snippet are enough
