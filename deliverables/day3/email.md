Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 3 (Wed W1) — Closures + `this` Fixes + Video Rep

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 3 (Wed W1)
track: JS Runtime
deliverable_expected: PR #2 — counter factory + three `this` fixes + boundary validation · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/3
extra_links: https://www.loom.com/share/b08863d3de9a4c4789c67127a1e9ad97, https://www.loom.com/share/a9394bbbde1d428f99b7b4dad836f70d
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Read javascript.info's "Closure" and "Object methods, this" before writing any code.
   - Built `createBookingCounter` as a closure-based factory with a private `counter` variable, and confirmed two counters never share state.
   - Reproduced the `this`-breaking bug from a detached method call, then fixed it three separate ways: `.bind()`, an arrow-function wrapper, and a static method that avoids `this` entirely.
   - Added a runtime boundary guard to `createBookingCounter` (rejects non-integer or negative seed counts), demonstrating the type-erasure gap from the mock interview in actual code.
   - Recorded a two-part English video walkthrough covering the `this`-breaking bug and the `.bind()` fix.

2) Evidence / how to verify
   - Exercise file: `exercises/day3-closures-this.js` — run with `node exercises/day3-closures-this.js`; expected output is documented in the file's closing comment block.
   - Video rep (part 1): https://www.loom.com/share/b08863d3de9a4c4789c67127a1e9ad97
   - Video rep (part 2, continuation): https://www.loom.com/share/a9394bbbde1d428f99b7b4dad836f70d
   - PR #3: https://github.com/ebandebasfs/2-week-training-plan/pull/3

3) Blockers (or "None")
   - None — PR #1 (Day 1) and PR #2 (Day 2) are still open/unmerged, so PR #3 is stacked on top of PR #2 (`feat/event-loop-exercises`) rather than `master`; diff will show Day 1 and Day 2's commits until those merge, and will clean up automatically once they do.

4) Tomorrow
   - SQL I — WHERE, NULLs, GROUP BY (Day 4)

5) Questions for EM (optional, or "None")
   - None
