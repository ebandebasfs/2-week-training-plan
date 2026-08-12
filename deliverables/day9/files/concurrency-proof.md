# Concurrency proof: two simultaneous bookings for the same slot

Ran against the live API + SQL Server container (not mocked). The script
(`api.queue-booking/src/db/day9-concurrency-proof.ts`, `npm run
proof:concurrency`) creates one isolated contested slot and two customers,
fires `POST /api/bookings` for both customers against that **same slot** at
the same time via `Promise.all()` so both requests are in flight together,
not sequential `await`s, then tears its own rows back out.

```
Contested slot:  25f4be4d-800a-4999-838e-52df494e9071
Customer A:      341dc6fa-4439-4acc-9f07-77556a51ad7d
Customer B:      9de97b1d-bef7-4879-a816-1de0c8ecfd9f

Firing both POST /bookings at once via Promise.all...

=== Customer A -> HTTP 201 ===
{
  "id": "F5F3423E-F36B-1410-8320-00A94AFFFBBF",
  "customer": { "id": "341DC6FA-...", "firstName": "Proof", "lastName": "CustomerA", ... },
  "slot": { "id": "25F4BE4D-...", "appointmentDate": "1900-02-01", "startTime": "09:00:00", ... },
  "status": "pending",
  "notes": "Day 9 concurrency proof",
  "bookingStatus": "pending"
}

=== Customer B -> HTTP 409 ===
{
  "message": "Slot 25f4be4d-800a-4999-838e-52df494e9071 is already booked",
  "error": "Conflict",
  "statusCode": 409
}

Elapsed: 123ms for both requests together (true concurrency, not sequential).

PASS: exactly one 201 and one 409.

Cleanup complete, proof slot/customers/booking removed.
```

## Ran it 4 times total, not just once

A race that only sometimes wins is not proof, it's a coin flip that happened
to land right. Re-ran the script 3 more times against fresh slots/customers:

```
=== RUN 1 ===  A -> 201   B -> 409   Elapsed: 51ms   PASS
=== RUN 2 ===  A -> 201   B -> 409   Elapsed: 48ms    PASS
=== RUN 3 ===  A -> 201   B -> 409   Elapsed: 48ms    PASS
```

Each test comes out identical, 4/4 always 201 and 409 for the concurrent calls.
This is expected because i wired the SQL transaction as 'pessimistic_write' which
blocks the second transaction's lock request until the first transaction commits or
rolls back. Instead of two request accessing at the same time, the two requests
transactions are queued up. 

## Why this counts as "true concurrency," not sequential awaits in disguise

- Both `fetch()` calls are started before either is awaited (`Promise.all([post(A), post(B)])`), so both HTTP requests are genuinely in flight together.
- Both land at the API and open their own DB transaction independently, there's no shared in-process lock or queue in the Node process forcing order.
- The ordering guarantee comes entirely from the database's row lock, not from the client or from Node's event loop.

## Cleanup verified

The proof slot, both proof customers, and whichever booking landed are
deleted at the end of each run. Confirmed no residue after all 4 runs:

```
leftover proof slots: 0
leftover proof customers: 0
```

Real Day 1 seed data and Day 6 bench data are untouched, the proof script
scopes every insert/delete to its own generated ids and a dedicated marker
date (`1900-02-01`, distinct from Day 6 bench's `1900-01-01`).
