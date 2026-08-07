# `booking_status` Migration Runbook

`booking_status` is a drill column, scoped to this exercise only — not wired into app logic. It's distinct from the `Booking` entity's existing `status` field (the `BookingStatus` enum), which is already `NOT NULL` with a CHECK constraint and has no unsafe-migration story left to demonstrate (that's why this drill needed a separate column in the first place).

## Step 1: Add Nullable Column

Migration: `AddBookingStatusColumn1786096769901.ts`

```sql
ALTER TABLE "bookings" ADD "booking_status" nvarchar(50)
```

**Expected Lock Time:** < 100ms — metadata-only change, no backfill, no existing rows touched.
**Verification:** `SELECT COUNT(*) FROM bookings WHERE booking_status IS NULL;` — returned 8 (all existing rows) immediately after this step.

## Step 2: Backfill

Script: `api.queue-booking/src/db/backfill-booking-status.ts` (`npm run backfill:booking-status`)

```ts
const BATCH_SIZE = 100;

while (true) {
    const rows = await AppDataSource.query(
        `SELECT TOP (@0) id FROM bookings WHERE booking_status IS NULL`,
        [BATCH_SIZE],
    );
    if (rows.length === 0) break;

    const ids = rows.map((r) => r.id);
    await AppDataSource.query(
        `UPDATE bookings SET booking_status = 'confirmed' WHERE id IN (${ids.map((_, i) => `@${i}`).join(', ')})`,
        ids,
    );
    // 100ms delay between batches
}
```

Backfill value: `'confirmed'` — existing bookings predate this column, so there's no real payment/confirmation history to derive from; `'confirmed'` was chosen as the safe assumed default rather than leaving ambiguity. Written batched (`TOP (@0)` / 100 rows at a time) on purpose, even though the seeded table only has 8 rows — the batching is what prevents a full-table lock at real scale, so it's part of the exercise, not overkill for this dataset.

**Expected Runtime:** at 8 rows, one batch, effectively instant. At scale, runtime is `(row_count / BATCH_SIZE) × (batch_update_time + 100ms delay)`.
**Result:** `SELECT COUNT(*) FROM bookings WHERE booking_status IS NULL;` → 0 after running.

## Step 3: Add NOT NULL Constraint

Migration: `BookingStatusNotNull1786096937340.ts`

```sql
ALTER TABLE "bookings" ALTER COLUMN "booking_status" nvarchar(50) NOT NULL
```

Note: SQL Server uses `ALTER COLUMN`, not the `MODIFY COLUMN` syntax in the primer's generic (MySQL-flavored) example.

**Verification:** migration ran and committed successfully with zero errors — since it only validates existing rows (all backfilled to `'confirmed'` in Step 2), a failure here would have meant the backfill was incomplete. Applying the constraint doesn't re-lock or rewrite rows, it just checks that no NULLs remain.

## Rollback Plan

- **Undo Step 1** (`AddBookingStatusColumn.down()`): `ALTER TABLE "bookings" DROP COLUMN "booking_status"` — safe any time before Step 3, since the column carries no app logic.
- **Undo Step 3** (`BookingStatusNotNull.down()`): `ALTER TABLE "bookings" ALTER COLUMN "booking_status" nvarchar(50)` — drops the constraint back to nullable, data untouched. Run via `npm run migration:revert`.
- Both verified working by running `migration:revert` during the index drill below and confirming the schema returned to its prior state each time.

## Index Creation

Index already existed on `customer_id` (`IDX_8e21b7ae33e7b0673270de4146`, from Day 1's `InitSchema`, driven by `@Index()` on `Booking.customer`). Drop/recreate handled by `DropCustomerIdIndex1786097092932.ts`:

```sql
-- up()
DROP INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings"

-- down()
CREATE INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings" ("customer_id")
```

### Attempt 1 — real seeded data (8 rows)

**Query time before index:** 3ms
**Query time after index:** 5ms

Flat / noise-level, and expected: 8 rows fit in a single data page, so SQL Server's optimizer skips the index entirely regardless of whether it exists — a full scan of 8 rows is already cheaper than an index seek + lookup. This isn't a failed drill, it's the correct real-world answer for this table's current size.

### Attempt 2 — bulk-seeded data at scale

To actually observe the mechanism, temporarily bulk-seeded 200,000 bookings/slots plus 20,000 dummy customers (`npm run bench:index-seed`), tagged (`appointment_date = '1900-01-01'`, `email LIKE '%@bench.local'`) for exact, safe removal afterward (`npm run bench:index-teardown`) — never touched the real Day 1 seed data (10 customers / 15 slots / 8 bookings, confirmed via row count after teardown).

First attempt at this bulk test put all 200k bookings under a single existing customer, which made the benchmark query match nearly the entire table — an unselective filter, which an index correctly provides no benefit for (this actually explained the initial confusing result: the index looked *slower* than no index, because of first-access cache-warming cost with zero selectivity benefit to offset it). Corrected by spreading bookings across 20,000 dummy customers instead, so the benchmark customer has ~10 matching rows out of 200k — genuinely selective.

**Query time before index:** 70ms (full table scan across 200k rows)
**Query time after index:** 5ms (index seek straight to the ~10 matching rows)

~14x improvement — this is the real evidence for why the index matters at scale, even though the current seeded table is too small to show it directly.
