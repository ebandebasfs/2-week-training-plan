# Day 6 — SQL III: Safe Migrations & Indexing

Source: `ethanpatrickbandebas-training-plan.html` — Mon · W2 · Day 6

## Activities (all required today, per the plan)

- [x] Pre-read (~30m): `deliverables/day6/files/primer-production-migrations.md` — mandatory before coding
- [x] Migration drill — added `booking_status` via the 3-step pattern (nullable → deploy → backfill → NOT NULL) with a rollback path (drill column per the plan's literal name; distinct in purpose from the existing `status`/`BookingStatus` enum, which is already NOT NULL with a CHECK constraint and has no unsafe-migration story left — `booking_status` is scoped strictly to this exercise, not wired into app logic)
- [x] Write the migration runbook — `deliverables/day6/migration-runbook.md`
- [x] Index on `customer_id` — already existed from Day 1's `InitSchema` migration (`IDX_8e21b7ae33e7b0673270de4146`, from the `@Index()` on `Booking.customer`); dropped → benchmarked → recreated → benchmarked instead of re-adding a duplicate index. Real seeded data (8 rows) showed a flat 3ms/5ms — expected, too small for the optimizer to bother with the index. Bulk-seeded 200k bookings across 20k dummy customers (`bench:index-seed`/`bench:index-teardown`, fully reverted, verified against Day 1's 10/15/8 counts) to get a real signal: 70ms → 5ms.
- [x] 2-min English video rep — why the 3-step pattern avoids table locks — https://www.loom.com/share/3c91bf6d2ab74e07b9bff271c4face0c

## Deliverable (per the plan's Deliverable box — sent to EM in the EOD email)

- [x] PR #6 — https://github.com/ebandebasfs/2-week-training-plan/pull/6 (opened with the exercise file; remaining commits — migrations, backfill, bench scripts, this deliverables folder — to follow)
- [x] Video rep — https://www.loom.com/share/3c91bf6d2ab74e07b9bff271c4face0c

## Migration runbook

Filled in at `deliverables/day6/migration-runbook.md` — Step 1/2/3, rollback verification, and both index-timing attempts (flat at seed scale, ~14x at bulk scale) with the reasoning for why each result is what it is.

## EOD email

Use `email.md` in this folder — copy its contents into the EOD submission per the Deliverable Email Template. Fill in the metadata block and evidence links before sending; `status` must be `Done`, `Partial`, or `Blocked`.
