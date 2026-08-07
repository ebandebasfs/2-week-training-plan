-- Day 5 — SQL II: Joins & Subqueries
-- Source: ethanpatrickbandebas-training-plan.html — Fri · W1 · Day 5
--
-- Run against the seeded queue_booking DB (see api.queue-booking/src/db/seed.ts).

-- ============================================================
-- Lab 1 — INNER / LEFT / RIGHT variants of the same query
-- Diff the row counts, one sentence per join type on why it differs.
-- ============================================================

-- INNER JOIN: customers with at least one booking
SELECT c.first_name, c.last_name, b.status
FROM customers c
INNER JOIN bookings b ON b.customer_id = c.id;

-- Row count: 8
-- One sentence: I inner joined the customers and bookings table first,
-- so that only customers with bookings (or relationship to bookings) are 
-- queried, the id matching in both tables is the indication that the 
-- customer has at least one booking.

-- LEFT JOIN: all customers, booking columns NULL if none
SELECT c.first_name, c.last_name, b.status AS booking_status
FROM customers c
LEFT JOIN bookings b ON b.customer_id = c.id;

-- Row count: 13
-- One sentence: Left join selects all rows in the left table,
-- which is the customer table and selects it even if it doesn't
-- have a match on the bookings(right) table, marking it NULL.

-- RIGHT JOIN: all bookings, customer columns NULL if orphaned (shouldn't happen given FK, but write it anyway)
SELECT c.first_name, c.last_name, b.status
FROM customers c
RIGHT JOIN bookings b ON b.customer_id = c.id; 

-- Row count: 8
-- One sentence: Right join selects all rows on the right table (bookings)
-- even if it is NULL, in this case, customer is require for a booking
-- to exist making the output identical to INNER JOIN.  

-- ============================================================
-- Lab 2 — Subquery vs JOIN: customers who booked in the last 7 days
-- Write both forms, verify they return the same rows.
-- ============================================================

-- Subquery form
SELECT * FROM customers c
WHERE EXISTS (
   SELECT 1 FROM bookings b
   WHERE b.customer_id = c.id AND b."created_at" >= DATEADD(day, -7, GETDATE())
 );

-- JOIN form (rewrite the above as a JOIN, dedupe with DISTINCT if needed)
SELECT DISTINCT c.* FROM customers c
INNER JOIN bookings b ON b.customer_id = c.id
WHERE b."created_at" >= DATEADD(day, -7, GETDATE());

-- Verification: same 5 customers, same IDs.
-- | id | name              | bookings (last 7d) | subquery form | JOIN form |
-- |----|-------------------|---------------------|----------------|-----------|
-- | 08 | Adella Stanton    | 2                   | 1 row          | 1 row     |
-- | 09 | Bradford Gerlach  | 2                   | 1 row          | 1 row     |
-- | 0A | Ronnie Bogan      | 1                   | 1 row          | 1 row     |
-- | 0B | Alvera Krajcik    | 2                   | 1 row          | 1 row     |
-- | 0C | Dixie Cole        | 1                   | 1 row          | 1 row     |


-- ============================================================
-- Notes / takeaways
-- ============================================================

/*
    Learning joins and subqueries is mildly complex but once I got the syntax
    its actually easy. Knowing how to use a type of join is also important
    because joins combine related data across tables. Subquieries are special
    because it lets me perform a query on a temporary table or output of a query
    which makes it also powerful for much more complex data fetching or logging.
*/
