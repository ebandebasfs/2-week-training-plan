Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 6 (Mon W2) — Migration Runbook + Index Evidence + Video Rep

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 6 (Mon W2)
track: SQL
deliverable_expected: PR #6 — migration runbook (3 steps + rollback) + index timing evidence · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/6
extra_links: https://www.loom.com/share/3c91bf6d2ab74e07b9bff271c4face0c
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Added `booking_status` to `bookings` via the 3-step safe-migration pattern (nullable add → batch backfill → NOT NULL), scoped as a drill column distinct from the existing `status`/`BookingStatus` enum field.
   - Wrote a batched backfill script (`backfill-booking-status.ts`, 100 rows/batch) and verified `booking_status IS NULL` hit 0 before applying the NOT NULL constraint.
   - Verified rollback on both migrations (`down()` for the nullable add and the NOT NULL constraint) by running `migration:revert` during testing.
   - Benchmarked the existing `customer_id` index: flat 3ms/5ms on the real 8-row seed (expected — too small for the optimizer to use it), then built a bulk seed/teardown pair (200k bookings across 20k dummy customers) to get a real signal — 70ms without the index vs 5ms with it, fully reverted and verified against Day 1's 10/15/8 seed counts afterward.
   - Recorded the video rep on why the 3-step pattern avoids table locks.

2) Evidence / how to verify
   - Migration runbook: `deliverables/day6/migration-runbook.md`
   - Migration files: `api.queue-booking/src/db/migrations/` (`AddBookingStatusColumn`, `BookingStatusNotNull`, `DropCustomerIdIndex`)
   - Bench scripts: `api.queue-booking/src/db/bench-index-seed.ts` / `bench-index-teardown.ts`
   - Index timing query: `exercises/day6-index-timing.sql`
   - Video rep: https://www.loom.com/share/3c91bf6d2ab74e07b9bff271c4face0c
   - PR #6: https://github.com/ebandebasfs/2-week-training-plan/pull/6

3) Blockers (or "None")
   - None

4) Tomorrow
   - React — Controlled Components & the Render Model (Day 7)

5) Questions for EM (optional, or "None")
   -
