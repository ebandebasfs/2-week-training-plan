# Day 9 Reflection: What I Said vs. What the Code Taught Me

## What I said in the interview

Asked about transactions, I gave the textbook answer and the right words:
rollback on failure, "you wrap related writes in a transaction so
they succeed or fail together." It sounded fine in the Q&A.

Based on what I remember, I assessed the given exercise code, managed to
find some bugs and logic errors. Majority was incorrect null checks or no
null checks at all. The exercise code just accessed data or a row in the
database without checking if the row existed first.

What I didn't catch was the race condition itself. The exercise had the
same check-then-act shape as the null-check bugs, I just didn't see it.

## What the naive code (Day 8) actually did

Here's what I saw in the naive code from Day 8. The process was:

1. find the slot being booked
2. check if the slot exists and is available
3. check if the customer record exists
4. save the booking

The problem: if two concurrent requests both run and both get past step 2
before either reaches step 4, both requests can proceed to save the
booking. Nothing throws, nothing looks wrong in a single-request test. It's
only visible if you specifically test two requests hitting the same slot at
the same time.

It's the exact same shape as the interview gap: I know what a transaction
is for in the abstract, but "does this specific endpoint need one, right
now" isn't a question I was asking myself while writing it.

## What closing it taught me

I actually discovered there's a deeper level of row-access control in SQL
that I hadn't used before: `UPDLOCK` and `ROWLOCK`.

`UPDLOCK` claims a row for one transaction. If a second transaction tries
to access that same row while the first one holds the lock, the second one
doesn't get to run "second" or "queued politely." It's **physically blocked
from reading anything** until the first transaction fully commits or rolls
back. It's not about who asked first, it's about whichever transaction the
database actually grants the lock to. `ROWLOCK` just tells SQL Server to
lock at the row level instead of escalating to a page or table lock.

A few other things fell out of actually building this instead of just
knowing the term:

- **A transaction alone isn't the fix.** I assumed `BEGIN...COMMIT` would
  be enough. It isn't. Under SQL Server's default isolation, a plain
  `SELECT` inside a transaction still lets another transaction read the
  same row. You have to actually claim the row with a lock
  (`setLock('pessimistic_write')`). The transaction and the lock are two
  different things, and I was conflating them.
- **The ORM's lock API was enough. I didn't need raw SQL.** I expected I'd
  have to write raw `WITH (UPDLOCK, HOLDLOCK)` SQL, which I've been
  avoiding. TypeORM's `.setLock('pessimistic_write')` does the same job
  here. Not knowing what the ORM generates underneath was the actual gap,
  not using an ORM.
- **A passing test isn't proof unless it could have failed.** Two
  sequential `await`s would prove nothing since there'd be no real race.
  `Promise.all` fires both at once, which is what makes 201/409 mean
  something. I ran it four times, not once.
- **Defense in depth is separate from "the lock works."** The unique index
  on `slot_id` protects any path that bypasses this method entirely, not
  just this one. I hadn't been asking "what if this gets called some other
  way" before.

## What I'd do differently going forward

Before I ship any endpoint that reads something and then writes based on
it, I now ask myself "what if two requests hit this at the exact same
time," as I'm writing it, not something a reviewer catches later. That's
the actual gap from the interview. It wasn't that I didn't know what a
transaction was, I could explain it fine. I just wasn't asking that
question about my own code in the moment, same as how I caught the
null-check bugs in the exercise but walked right past the race condition
sitting next to them.
