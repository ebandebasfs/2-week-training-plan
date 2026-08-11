# Production Migrations: Safe Database Changes

**Read this before Day 6 migration lab. Time: ~20 minutes.**

---

## Why Migrations Are Dangerous

Imagine you have a `bookings` table with 100,000 rows. You want to add a `status` column with a NOT NULL constraint.

**Naive approach:**
```sql
ALTER TABLE bookings ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'confirmed';
```

**What happens:**
1. Database locks the table
2. Tries to add the column and backfill all 100,000 rows with 'confirmed'
3. This takes 30 seconds (or longer for bigger tables)
4. While locked, no other requests can read or write
5. Your app times out or crashes

**Result:** Downtime for your users.

---

## The Safe Migration Pattern: 3 Steps

### Step 1: Add the Column as NULLABLE (Deploy 1)

```sql
ALTER TABLE bookings ADD COLUMN status VARCHAR(50);
```

**Why it's safe:**
- No backfill needed (column is NULL for existing rows)
- Locking time is minimal (microseconds)
- No downtime

**Deploy this immediately.** Users can already create new bookings, which will have a NULL status (temporary, but OK for now).

### Step 2: Backfill Existing Data (Offline, No Deploy Needed)

**Do NOT do this in a single SQL statement** — it will lock the table for a long time.

Instead, backfill in batches:

```javascript
// Backfill script (run this once, offline or during low traffic)
const BATCH_SIZE = 1000;

async function backfillStatus() {
  let offset = 0;
  let backfilled = 0;

  while (true) {
    // Fetch a batch of rows with NULL status
    const rows = await db.query(
      'SELECT id FROM bookings WHERE status IS NULL LIMIT ?',
      [BATCH_SIZE]
    );

    if (rows.length === 0) break; // All done

    const ids = rows.map(r => r.id);

    // Update this batch
    await db.query(
      'UPDATE bookings SET status = ? WHERE id IN (' + 
      ids.map(() => '?').join(',') + ')',
      ['confirmed', ...ids]
    );

    backfilled += rows.length;
    console.log(`Backfilled ${backfilled} rows...`);

    // Sleep between batches to avoid overwhelming the DB
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`Backfill complete: ${backfilled} rows`);
}

backfillStatus();
```

**Why batching is safe:**
- Each batch locks only 1000 rows, not the whole table
- Your app continues to serve requests
- If the script crashes halfway, you can restart it (it'll skip rows that are already filled)

### Step 3: Add the NOT NULL Constraint (Deploy 2)

```sql
ALTER TABLE bookings MODIFY COLUMN status VARCHAR(50) NOT NULL;
```

or in SQLite (which has limited ALTER TABLE):

```sql
-- SQLite doesn't support MODIFY, so you rebuild the table:
ALTER TABLE bookings RENAME TO bookings_old;

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  slot_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  -- ... other columns ...
  FOREIGN KEY (slot_id) REFERENCES slots(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO bookings SELECT * FROM bookings_old;
DROP TABLE bookings_old;
```

**Why it's safe:**
- All rows already have a status (from the backfill)
- Adding the constraint doesn't re-lock; it just validates that no NULLs exist

**Result:** Production-safe migration with near-zero downtime.

---

## Timeline & Verification

### Day 1: Deploy Step 1 (Add Nullable Column)

```sql
ALTER TABLE bookings ADD COLUMN status VARCHAR(50);
```

**Verification:**
```sql
SELECT COUNT(*) FROM bookings WHERE status IS NULL;
-- Should return: 100000 (or however many rows)

SELECT * FROM bookings LIMIT 1;
-- Should show: status = NULL
```

### Day 1–2: Run Backfill Script

Monitor it in a separate process. Check progress:

```sql
SELECT COUNT(*) FROM bookings WHERE status IS NULL;
-- Decreases as the script runs
-- Eventually reaches: 0
```

### Day 2–3: Deploy Step 3 (Add Constraint)

Once backfill is 100% done, add the constraint.

**Verification:**
```sql
-- Try to insert a booking without a status — should fail
INSERT INTO bookings (slot_id, customer_id) VALUES (5, 123);
-- Error: status cannot be NULL ✓
```

---

## Indexing: When & How

Creating an index can also lock tables. Use the same pattern:

### Slow (Locks Table):
```sql
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
-- Table is locked while the index is built (painful on large tables)
```

### Fast (Concurrent Index Creation in PostgreSQL):
```sql
CREATE INDEX CONCURRENTLY idx_bookings_customer ON bookings(customer_id);
-- Table stays readable while index is built (seconds instead of minutes)
```

### SQLite (Limited Options):
SQLite doesn't support concurrent index creation. Instead:
1. Create the index during low-traffic time
2. Keep the lock time short with batching if possible

**Day 6 Lab:** You'll create an index on `customer_id` and measure the performance difference:

```sql
-- Before index
SELECT COUNT(*) FROM bookings WHERE customer_id = 5; -- takes 50ms

-- Create index
CREATE INDEX idx_bookings_customer ON bookings(customer_id);

-- After index
SELECT COUNT(*) FROM bookings WHERE customer_id = 5; -- takes 2ms
```

---

## Rollback: When Things Go Wrong

If something breaks, you need to undo the migration.

### Undo Step 1 (Rollback the Nullable Column)

```sql
ALTER TABLE bookings DROP COLUMN status;
```

**When to use:** If you realize you need a different column name or type before the backfill is done.

### Undo Step 3 (Rollback the Constraint)

This is trickier. If the constraint is already enforced, removing it requires rebuilding the table (in SQLite):

```sql
-- Option 1: Drop the table and recreate without the constraint (complex, risky)
-- Option 2: Accept the constraint and run a new migration to fix the schema

-- Safest: Run the backfill again (ensuring all rows have values), then retry Step 3
```

**Lesson:** Test migrations on a staging DB first.

---

## Your Day 6 Lab

You'll:

1. **Add a nullable column:** `booking_status VARCHAR(50)`
2. **Write a backfill script:** Batch-update 100 rows at a time to `'confirmed'`
3. **Add the constraint:** `ALTER TABLE ... MODIFY booking_status ... NOT NULL`
4. **Test the index:** Create an index on `customer_id`, measure query time before/after

### Deliverable: Migration Runbook

Write a markdown file documenting:
- **Step 1:** ALTER command + expected locks time
- **Step 2:** Backfill script (copy-pasteable) + expected runtime
- **Step 3:** Constraint command + verification query
- **Rollback Plan:** How to undo Step 1 and Step 3 if needed
- **Index Creation:** Index command + performance measurement

Example structure:

```markdown
# Booking Status Migration Runbook

## Step 1: Add Nullable Column
```sql
ALTER TABLE bookings ADD COLUMN booking_status VARCHAR(50);
```

**Expected Lock Time:** < 100ms
**Verification:** `SELECT COUNT(*) FROM bookings WHERE booking_status IS NULL;`

## Step 2: Backfill ...
[script here]

## Step 3: Add Constraint ...
[command here]

## Rollback ...

## Index Creation ...
```

---

## Checklist for Production Migrations

- [ ] Test on a local or staging database first
- [ ] Write the migration as code (SQL + backfill script), not ad-hoc commands
- [ ] Measure lock times on realistic data volumes
- [ ] Plan a rollback (how to undo each step)
- [ ] Have a communication plan (will users see downtime? For how long?)
- [ ] Test the backfill script on a copy of production data
- [ ] Run during low-traffic hours if possible
- [ ] Monitor the migration in real-time
- [ ] Verify the constraint or index after deployment

---

## Resources

- **Rails Migrations (Gem for Safe Migrations):** https://github.com/ankane/strong_migrations (concepts apply even if not using Rails)
- **Pluralsight Introduction to SQL:** https://app.pluralsight.com/ilx/video-courses/sql-introduction/course-overview
- **PostgreSQL Safe ALTER TABLE:** https://www.postgresql.org/docs/current/sql-altertable.html
- **SQLite ALTER TABLE Limitations:** https://www.sqlite.org/lang_altertable.html

---

**Next:** Day 6 hands-on. Add a column, backfill it, and add the constraint step-by-step. Document the runbook.
