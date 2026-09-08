#!/usr/bin/env node
/**
 * Mini token pipeline: figma-export.json → src/theme/foundations/colors.ts
 *
 * 1. Writes the primitive palette (both modes, Figma names) to colors.ts.
 * 2. Prints a cross-reference report: for every semantic color style, which
 *    primitive carries the same hex in that mode — or ORPHAN when none does.
 *    The report is the input for hand-writing src/theme/semanticTokens.ts.
 *
 * Usage: node scripts/figma-to-tokens.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const exportPath = resolve(here, '../src/theme/figma-export.json');
const outPath = resolve(here, '../src/theme/foundations/colors.ts');

const { colorStyles } = JSON.parse(readFileSync(exportPath, 'utf8'));
const MODES = ['Light', 'Dark'];
const STEP_ORDER = ['primary', 'secondary', 'tertiary', 'quaternary'];

const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// "Indigo/Primary" → { hue: 'indigo', step: 'primary', note }
function parsePrimitive(name) {
  const [hue, rawStep] = name.split('/');
  // D3: Dark/<hue>/Background is the lightest step of that hue → quaternary
  const step = rawStep === 'Background' ? 'quaternary' : lower(rawStep);
  return { hue: lower(hue), step, note: rawStep === 'Background' ? ' // Figma: Background' : '' };
}

// ---------- 1. colors.ts ----------
const palette = {}; // { light: { indigo: { primary: { hex, note } } } }
for (const mode of MODES) {
  const m = lower(mode);
  palette[m] = {};
  for (const [name, hex] of Object.entries(colorStyles.primitives[mode])) {
    const { hue, step, note } = parsePrimitive(name);
    palette[m][hue] ??= {};
    palette[m][hue][step] = { hex, note };
  }
}

const lines = [
  '// GENERATED from figma-export.json by scripts/figma-to-tokens.mjs — do not edit.',
  '// Primitive colour palette. Figma defines one palette PER MODE (Light/Dark), so the',
  '// same name can carry different values across modes; this is kept for fidelity even',
  '// though primitives in a token system are normally mode-less.',
  'export const colors = {',
];
for (const m of Object.keys(palette)) {
  lines.push(`  ${m}: {`);
  for (const hue of Object.keys(palette[m]).sort((a, b) => a.localeCompare(b))) {
    lines.push(`    ${hue}: {`);
    const steps = Object.keys(palette[m][hue]).sort((a, b) => STEP_ORDER.indexOf(a) - STEP_ORDER.indexOf(b));
    for (const step of steps) {
      const { hex, note } = palette[m][hue][step];
      lines.push(`      ${step}: '${hex}',${note}`);
    }
    lines.push('    },');
  }
  lines.push('  },');
}
lines.push('} as const;', '');
writeFileSync(outPath, lines.join('\n'));
console.log(`wrote ${outPath}`);

// ---------- 2. semantic cross-reference report ----------
const semanticNames = Object.keys(colorStyles.semantic.Light);
const pad = (s, n) => s.padEnd(n);
console.log('\nSemantic → primitive cross-reference');
console.log(`${pad('Figma semantic', 28)} ${pad('Light', 32)} Dark`);
let orphans = 0;
for (const name of semanticNames) {
  const cells = MODES.map((mode) => {
    const m = lower(mode);
    const hex = colorStyles.semantic[mode][name];
    for (const hue of Object.keys(palette[m])) {
      for (const step of Object.keys(palette[m][hue])) {
        if (palette[m][hue][step].hex.toUpperCase() === hex.toUpperCase()) return `${m}.${hue}.${step}`;
      }
    }
    orphans++;
    return `ORPHAN ${hex}`;
  });
  console.log(`${pad(name, 28)} ${pad(cells[0], 32)} ${cells[1]}`);
}
console.log(`\n${semanticNames.length} semantic styles, ${orphans} orphan values (no matching primitive in that mode).`);
