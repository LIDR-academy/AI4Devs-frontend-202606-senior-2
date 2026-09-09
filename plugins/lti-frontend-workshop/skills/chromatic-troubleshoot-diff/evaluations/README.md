# Troubleshoot Diff Evaluations

These scenarios verify that the `chromatic-troubleshoot-diff` skill:
- picks the right rendering-stability branch
- separates local rendering issues from Chromatic-only drift
- protects the expected-change boundary before stabilization advice
- grounds fix paths in the local Chromatic source pack when the docs cover the issue
- asks for one artifact at a time
- avoids overusing suppression-style fixes
- gives one exact next step
