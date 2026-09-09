# Output Contract

Every response must include one diagnosis card.

## Standard diagnosis card

Use this structure:

```markdown
## Diagnosis
- Code: <normalized diagnosis code>
- Confidence: High | Medium | Low
- Current state: Expected change | Local rendering issue | Chromatic-only rendering drift | Not enough evidence
- Summary: <one-sentence plain-language readout>

## Key Evidence
- <signal 1>
- <signal 2>
- <signal 3>

## Source Notes
- <local source file(s) consulted, or `None` if no source file was needed>

## Why It Is Happening
<one short paragraph explaining why the evidence maps to this diagnosis>

## Recommended Next Step
- <the single highest-value check, artifact, or fix>

## Likely Fix Path
- <the narrowest stabilizing change or validation path>

## Unresolved
- <what remains unknown, or `None`>

## Verification
- <how to confirm the diff is now stable>
```

## Audience adaptation

Default posture:
- keep the diagnosis card customer-safe
- use technical terms only when they improve precision
- avoid repo-internal jargon unless the user already used it
- give one next step, not a full backlog

## Support-ready summary

When the issue is still ambiguous after one targeted follow-up, append:

```markdown
## Support Summary
- Problem: <plain-language problem statement>
- Affected story: <story name or `unknown`>
- Evidence gathered: <bulleted list>
- Source notes consulted: <local source file list or `None`>
- Most likely diagnosis: <normalized code plus plain-language label>
- Remaining unknown: <single biggest missing fact>
```
