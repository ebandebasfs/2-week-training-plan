/*
 * Day 4 — SQL I: WHERE, NULLs, GROUP BY — lab
 *
 * Three queries against the seeded `queue_booking` DB (10 customers,
 * 15 slots, 8 bookings — see api.queue-booking/src/db/seed.ts). Each is
 * written as its own separate query below: problem, your query, actual
 * output (paste real results, not predicted ones), one-sentence takeaway.
 */


/*
 * Lab 1 — customers with 2+ bookings (GROUP BY + HAVING)
 * Problem: list every customer who has 2 or more bookings (any status),
 * with their booking count.
 */

-- Your query:
SELECT c.first_name, c.last_name, COUNT(b.id) as total_bookings 
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
GROUP BY c.first_name, c.last_name
HAVING COUNT(b.id) >= 2

-- Actual output (paste real result):
--
--   first_name   last_name   total_bookings
--   -----------  ----------  --------------
--   Bradford     Gerlach     2
--   Alvera       Krajcik     2
--   Adella       Stanton     2

-- One sentence: why HAVING here and not WHERE?
--  I'm using HAVING here because WHERE filters rows before aggregation
--  happens so there is no result on COUNT(b.id) yet to filter.

/*
 * Lab 2 — daily booking count with date grouping 
 * Problem: for each appointment date that has at least one booking, show
 * how many bookings fall on it.
 */

-- Your query:
SELECT s.appointment_date, COUNT(b.id) AS total_bookings
FROM bookings b
JOIN slots s ON b.slot_id = s.id
GROUP BY s.appointment_date
ORDER BY s.appointment_date;

-- Actual output (paste real result):
--
--   appointment_date   total_bookings
--   -----------------  --------------
--   2026-08-01         1
--   2026-08-03         2
--   2026-08-06         1
--   2026-08-09         1
--   2026-08-11         1
--   2026-08-12         1
--   2026-08-13         1

-- One sentence takeaway:
--  An inner JOIN excludes dates with no bookings because it excludes NULL values, GROUP BY
--  here only ever produces the "at least one booking" rows the problem asks.

/*
 * Lab 3 — bookings with NULL vs non-NULL notes
 * Problem: split bookings into two groups — those with a note and those
 * without — and show the count in each group.
 */

-- Your query:
SELECT
    CASE WHEN notes IS NULL THEN 'No Note' ELSE 'Has Note' END AS note_status,
    COUNT(*) AS total
FROM bookings
GROUP BY CASE WHEN notes IS NULL THEN 'No Note' ELSE 'Has Note' END;

-- Actual output (paste real result):
--
--   note_status   total
--   -----------   -----
--   Has Note      2
--   No Note       6

-- One sentence: what changes if you check `notes = NULL` instead of `notes IS NULL`?
--  notes = NULL always evaluates to unknown and NULL value cannot be compared, so I have to test it
--  with IS NULL instead of =.
