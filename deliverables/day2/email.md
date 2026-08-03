Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 2 (Tue W1) — Event-Loop Exercise + Video Rep

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 2 (Tue W1)
track: JS Runtime
deliverable_expected: PR #1 — event-loop exercise + annotations · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/2
extra_links: https://www.loom.com/share/405ec1e4878c4c8e89249d17c425cbfe
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Read javascript.info's event-loop and async/await material before writing any code.
   - Wrote three functions in `exercises/day2-event-loop.js` — one using `setTimeout`, one using `Promise.then()`, one using `queueMicrotask()` — that log in an order different from call order.
   - Annotated the file with the expected output (`1, 1b, 2, 3, 4`) and an explanation of why `setTimeout(fn, 0)` still runs last, despite being called first.
   - Recorded a 2-minute walkthrough explaining the call stack, microtask queue, and macrotask queue, and why microtasks always drain before the next macrotask.
   - Branched this work off `feat/typeorm-setup` (Day 1, still under review) since the exercise depends on the Day 1 repo scaffold.

2) Evidence / how to verify
   - Exercise file: `exercises/day2-event-loop.js` — run with `node exercises/day2-event-loop.js`, expect `1, 1b, 2, 3, 4` in that order
   - Video rep: https://www.loom.com/share/405ec1e4878c4c8e89249d17c425cbfe
   - PR #2: https://github.com/ebandebasfs/2-week-training-plan/pull/2

3) Blockers (or "None")
   - None — PR #1 (Day 1) is still open/unmerged, so PR #2 is stacked on top of it (`feat/typeorm-setup`) rather than `master`; diff will show Day 1's commits until #1 merges, and will clean up automatically once #1 merges.

4) Tomorrow
   - JS Runtime II — Closures, `this` & Runtime Validation (Day 3)

5) Questions for EM (optional, or "None")
   - None
