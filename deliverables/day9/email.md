Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 9 (Thu W2): Transaction-Safe Booking + Concurrency Proof + Reflection

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 9 (Thu W2)
track: SQL
deliverable_expected: transaction-safe endpoint + concurrency proof (201 + 409) + reflection MD
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/9
extra_links: `deliverables/day9/files/concurrency-proof.md`, `deliverables/day9/reflection.md`
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Closed Day 8's double-booking race by wrapping `POST /bookings` in a transaction that takes a real row lock (`setLock('pessimistic_write')`) on the slot before checking availability, so a concurrent request can no longer read "available" out from under the first one.
   - Kept the existing unique index on `bookings.slot_id` as a second, independent safety net, and mapped its violation (SQL 2627/2601) to a `409` instead of letting it surface as a raw `500`.
   - Proved it with two real concurrent `POST /bookings` for the same slot via `Promise.all()` against the live API + SQL Server, ran it 4 separate times, 4/4 exactly one `201` and one `409`.
   - Wrote the loop-closure reflection: what I said about transactions in the interview vs. what the naive check-then-act code actually did, and what building the real fix taught me.
   - Also added a `UnitOfWork` wrapper (matching a convention from my own `devlog` repo) and a `CustomersModule` mirroring the existing `SlotsModule` shape. Consistency cleanup, not required by today's rubric.

2) Evidence / how to verify
   - Transaction-safe endpoint: `api.queue-booking/src/modules/bookings/bookings.service.ts`
   - Concurrency proof script: `api.queue-booking/src/db/day9-concurrency-proof.ts` (`npm run proof:concurrency`)
   - Concurrency proof output: `deliverables/day9/files/concurrency-proof.md`
   - Reflection: `deliverables/day9/reflection.md`
   - Full day writeup: `deliverables/day9/README.md`
   - PR #9: https://github.com/ebandebasfs/2-week-training-plan/pull/9

3) Blockers (or "None")
   - `primer-acid-transactions.md` was never sent, so I skipped the pre-read and worked directly against the real SQL Server instead of the primer's SQLite examples. Noted in the README, not treating it as blocking.
   - PR #9 builds on top of Day 8's PR #8, which itself sits on Day 6's PR #6 and Day 7's PR #7 (both still open). Same stacking situation Day 8 flagged, expected to self-resolve once those land.

4) Tomorrow
   - Day 10, Communication Day: full English walkthrough of all 10 days, re-run SQL broken-report exercise (new query), final README, book Mon W3 Skill IQ retakes.

5) Questions for EM (optional, or "None")
   - Can you send the ACID transactions primer, even after the fact, so I have it for reference alongside what I worked out hands-on?
