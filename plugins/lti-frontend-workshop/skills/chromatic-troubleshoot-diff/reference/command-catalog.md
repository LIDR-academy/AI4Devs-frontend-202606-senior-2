# Visual Diff Command Catalog

Use these only when the repo is available and one targeted proof step will settle the next branch.

## Repo probes

### Find Chromatic parameters, modes, and shared globals

```bash
rg -n "chromatic:|pauseAnimationAtEnd|delay|diffThreshold|modes|viewports|globals|initialGlobals|cropToViewport" .storybook src stories
```

### Find font loading setup and preview-head hooks

```bash
rg -n "@font-face|font-display|font-family|FontFace|next/font|document\\.fonts|preview-head|preload|fonts?/" src .storybook public
```

### Find static asset serving and remote-resource configuration

```bash
rg -n "staticDirs|assetDomains|srcset|poster=|iframe|img|video|https://|http://" .storybook src stories public
```

### Find animation and transition sources

```bash
rg -n "pauseAnimationAtEnd|MotionGlobalConfig|skipAnimations|animation|transition|keyframes|requestAnimationFrame|framer-motion|isChromatic" src .storybook stories
```

### Find sticky or fixed layout surfaces

```bash
rg -n "position:\\s*(sticky|fixed)|display:\\s*(grid|flex)|100vh|overflow:\\s*(hidden|scroll)" src .storybook stories
```

### Find possible nondeterministic rendering inputs

```bash
rg -n "Math.random|Date.now|new Date\\(|crypto.randomUUID|setTimeout|setInterval|seedrandom|mockdate" src .storybook stories
```

## Script guidance

- Read `package.json` before suggesting a local Storybook command.
- Use the project's existing Storybook dev or build script if one exists.
- Do not invent script names when the repo already defines them.
