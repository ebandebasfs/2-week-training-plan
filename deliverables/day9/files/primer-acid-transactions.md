# ACID & Transactions Primer

**Read this before Day 9 double-booking lab. Time: ~30 minutes.**

---

## The Double-Booking Problem

Imagine two users try to book the same 2pm slot at exactly the same time:

**Without transactions:**
```
User A: SELECT available slots WHERE slot_id = 5
        → Result: yes, slot 5 is available
User B: SELECT available slots WHERE slot_id = 5
        → Result: yes, slot 5 is available
User A: INSERT booking for slot 5 ✓
User B: INSERT booking for slot 5 ✓ (OOPS — both booked the same slot!)
```

**With transactions:**
```
User A: BEGIN TRANSACTION
        SELECT available WHERE slot_id = 5 FOR UPDATE (locks the row)
        → yes, available
        INSERT booking for slot 5
        COMMIT ✓ (lock released)
User B: BEGIN TRANSACTION
        SELECT available WHERE slot_id = 5 FOR UPDATE
        → WAITS (row is locked by User A)
        ... User A commits ...
        → now locked-and-booked, slot 5 unavailable
        ROLLBACK or try different slot
```

**Result:** Only one user books slot 5. The other sees "slot unavailable" (not a secret double-booking).

---

## ACID — What Transactions Guarantee

### **A — Atomicity** ("All or Nothing")

A transaction is atomic: either all steps succeed, or none do. There's no in-between.

**Example:**
```sql
BEGIN TRANSACTION;
  UPDATE slots SET available = FALSE WHERE id = 5;
  INSERT INTO bookings (slot_id, customer_id) VALUES (5, 123);
  INSERT INTO booking_history (event, slot_id) VALUES ('booked', 5);
COMMIT;
```

If step 2 fails (e.g., customer_id doesn't exist), the whole transaction rolls back:
- Slot 5 is NOT marked unavailable
- Booking is NOT inserted
- History is NOT recorded

**Why it matters:** No orphaned bookings (slot unavailable but no booking record).

### **C — Consistency** ("Rules Are Enforced")

The database enforces all integrity rules before and after every transaction.

**Examples:**
- A booking's `slot_id` must exist in the slots table (foreign key)
- A slot can't have duplicate bookings from the same customer (unique constraint)
- A slot's `available` boolean must be NOT NULL

If a transaction violates a rule, it rolls back.

**Why it matters:** Your data model is always valid — no invalid states sneak in.

### **I — Isolation** ("Transactions Don't See Each Other's Partial Work")

One transaction's in-progress changes are invisible to other transactions until it commits.

**Example:**
```
Transaction A: BEGIN
               UPDATE slot 5: available = FALSE
               (not committed yet)

Transaction B: SELECT slot 5
               → sees available = TRUE (A's change is invisible)

Transaction A: COMMIT

Transaction B: SELECT slot 5
               → now sees available = FALSE (A's committed change is visible)
```

**Isolation Levels** (how strict is the invisibility?):
- **READ UNCOMMITTED** — Sloppy. Transactions see each other's uncommitted changes. (Rare in production.)
- **READ COMMITTED** — Standard. Transactions only see committed changes. (Most databases default.)
- **REPEATABLE READ** — Stricter. If you read the same row twice in one transaction, you see the same value (even if another transaction committed a change in between). (SQLite's default.)
- **SERIALIZABLE** — Strictest. Transactions run as if they're serial (one after another), never concurrent. (Slowest, safest.)

**Why it matters:** In a queue-booking scenario, you want at least READ COMMITTED (or REPEATABLE READ in SQLite). READ UNCOMMITTED can let two users both see a slot as available.

### **D — Durability** ("Committed Data Survives Crashes")

Once you `COMMIT`, the data is written to disk. If the database crashes, the committed data is still there.

(In SQLite with file-based storage, this is automatic.)

**Why it matters:** Users trust that a "booking confirmed" email means the booking is safe, even if the server crashes 1 second later.

---

## How Transactions Prevent Double-Booking

### Naive Approach (Still Broken)

```javascript
// Endpoint: POST /bookings
async function createBooking(req, res) {
  const { slot_id, customer_id } = req.body;

  // Check if available
  const slot = await db.query('SELECT * FROM slots WHERE id = ?', [slot_id]);
  if (!slot.available) {
    return res.status(409).send('Slot not available');
  }

  // Mark as unavailable
  await db.query('UPDATE slots SET available = FALSE WHERE id = ?', [slot_id]);

  // Create booking record
  await db.query('INSERT INTO bookings (slot_id, customer_id) VALUES (?, ?)', 
                 [slot_id, customer_id]);

  res.json({ success: true });
}
```

**Problem:** Between the SELECT and the UPDATE, another request can sneak in and also see the slot as available.

### Correct Approach (With Transaction + Lock)

```javascript
async function createBooking(req, res) {
  const { slot_id, customer_id } = req.body;
  const trx = await db.transaction();

  try {
    // Check availability AND lock the row (no one else can touch it)
    const slot = await trx.raw(
      'SELECT * FROM slots WHERE id = ? FOR UPDATE',
      [slot_id]
    );

    if (!slot[0][0].available) {
      throw new Error('Slot not available');
    }

    // Mark as unavailable (within the same transaction, under the lock)
    await trx.raw(
      'UPDATE slots SET available = FALSE WHERE id = ?',
      [slot_id]
    );

    // Create booking (within the same transaction)
    await trx.raw(
      'INSERT INTO bookings (slot_id, customer_id) VALUES (?, ?)',
      [slot_id, customer_id]
    );

    // Commit all at once
    await trx.commit();

    res.json({ success: true });
  } catch (error) {
    await trx.rollback(); // Undo everything
    res.status(409).json({ error: error.message });
  }
}
```

**Why this works:**
1. `BEGIN TRANSACTION` starts the transaction
2. `FOR UPDATE` locks the slot row so no other transaction can read it
3. We check availability (under the lock)
4. We update and insert (all under the lock)
5. `COMMIT` releases the lock and makes changes permanent
6. Another request waiting on the lock now sees the slot as unavailable

**Result:** Exactly one booking succeeds for each slot.

---

## SQLite-Specific Behavior

SQLite has quirks compared to PostgreSQL or MySQL:

### 1. **No Row-Level Locking — Only Table Locks**

SQLite locks entire tables, not individual rows. So `FOR UPDATE` effectively locks the whole `slots` table.

**Implication:** Multiple concurrent transactions on *different* slots will still block each other.

**Why it's still OK for your app:** Queue-booking is simple (small tables), so table locks don't hurt. If you were building a massive booking system, you'd use PostgreSQL.

### 2. **Default Isolation: REPEATABLE READ**

```sql
PRAGMA journal_mode = WAL; -- Use write-ahead logging (modern, fast)
BEGIN;
  SELECT slot FROM slots WHERE id = 5;
  -- ... time passes, another transaction commits a change to this row ...
  SELECT slot FROM slots WHERE id = 5; -- You see the SAME value as before
COMMIT;
```

SQLite snapshots the data at the start of your transaction.

**Why it's good:** Your transaction never sees half-finished updates from other transactions.

### 3. **Pragmas You Might Use**

```sql
-- Enable WAL (write-ahead logging) for better concurrency
PRAGMA journal_mode = WAL;

-- Set the isolation level
PRAGMA foreign_keys = ON; -- Enforce foreign key constraints
```

---

## Day 9 Lab: What You'll Build

1. **Endpoint:** POST `/bookings` with a transaction that:
   - Locks the slot row with `FOR UPDATE`
   - Checks availability
   - Creates the booking (atomically)
   - Returns 409 Conflict if the slot is taken

2. **Test:** Fire two simultaneous requests for the same slot:
   ```javascript
   Promise.all([
     fetch('/api/bookings', { body: { slot_id: 5, customer_id: 1 } }),
     fetch('/api/bookings', { body: { slot_id: 5, customer_id: 2 } })
   ]);
   ```
   **Expected:** One succeeds (201), one fails (409).

3. **Constraint Layer:** Add a unique constraint to the DB:
   ```sql
   ALTER TABLE bookings ADD CONSTRAINT uq_slot_customer
     UNIQUE (slot_id, customer_id);
   ```
   This is a safety net — if the transaction somehow doesn't catch a double-booking, the DB will.

---

## Common Mistakes (Avoid These)

### ❌ Mistake 1: Checking Availability Outside the Transaction

```javascript
// WRONG:
const slot = await db.query('SELECT * FROM slots WHERE id = ?', [slot_id]);
if (!slot.available) throw new Error('Booked');

const trx = await db.transaction();
await trx.query('UPDATE slots SET available = FALSE WHERE id = ?', [slot_id]);
// Race condition: another transaction could have updated the slot between the check and the transaction
```

**Right way:** Check and update inside the same transaction.

### ❌ Mistake 2: Forgetting the Lock (`FOR UPDATE`)

```javascript
// WRONG:
const trx = await db.transaction();
const slot = await trx.query('SELECT * FROM slots WHERE id = ?', [slot_id]);
// No FOR UPDATE — another transaction can also SELECT this row
if (!slot.available) throw new Error('Booked');
await trx.query('UPDATE slots SET available = FALSE WHERE id = ?', [slot_id]);
```

**Right way:** Add `FOR UPDATE` to the SELECT.

### ❌ Mistake 3: Testing Without Real Concurrency

```javascript
// WRONG:
// Just making two sequential calls
const res1 = await fetch('/api/bookings', { ... });
const res2 = await fetch('/api/bookings', { ... });
// res2 runs AFTER res1 finishes — not concurrent, will never expose the race condition

// RIGHT:
const [res1, res2] = await Promise.all([
  fetch('/api/bookings', { ... }),
  fetch('/api/bookings', { ... })
]);
// Both start at the same time
```

---

## Key Takeaways

| Concept | What It Is | Why It Matters |
|---------|-----------|----------------|
| **Transaction** | Group of SQL statements that run as one atomic unit | Prevents partial updates; if one statement fails, all roll back |
| **Atomicity** | All-or-nothing execution | No orphaned data |
| **Consistency** | Constraints are enforced | Data model is always valid |
| **Isolation** | Transactions don't see each other's uncommitted changes | One user's in-progress booking doesn't block another from seeing slot availability |
| **Durability** | Committed data survives crashes | Users can trust a "success" message |
| **Lock (FOR UPDATE)** | Prevents other transactions from reading/updating the same row | Serializes access to critical resources (like a slot being booked) |

---

## Resources

- **SQLite Transactions:** https://www.sqlite.org/transact.html
- **PostgreSQL ACID Guide:** https://www.postgresql.org/docs/current/tutorial-transactions.html (concepts apply across databases)
- **Race Conditions Explained:** https://en.wikipedia.org/wiki/Race_condition

---

**Next:** Day 9 hands-on. Build the endpoint, test with `Promise.all`, and verify your transaction prevents double-booking.
