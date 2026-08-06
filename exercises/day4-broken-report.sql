/*
 * Day 4 — SQL I: EM-led baseline, "broken report" exercise
 *
 * Report request (as handed off): "Give me a report of all customers with
 * their count of CONFIRMED bookings — including customers with zero."
 *
 * Below is the query as delivered, and the actual output it produces
 * against the seeded `queue_booking` DB. Something about that output
 * doesn't match the request. Find it, explain why it happens, and fix it.
 */

SELECT c.first_name, c.last_name, COUNT(b.id) AS confirmed_bookings
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id 
WHERE b.status = 'confirmed'
GROUP BY c.first_name, c.last_name;


/*
 * ACTUAL OUTPUT (captured via sqlcmd against the live seeded DB):
 *
 *   first_name   last_name   confirmed_bookings
 *   -----------  ----------  ------------------
 *   Adella       Stanton     1
 *   Alvera       Krajcik     1
 *   Bradford     Gerlach     1
 *   Ronnie       Bogan       1
 *
 * There are 10 seeded customers. Only 4 rows came back.
 */

-- ── YOUR WORK BELOW ───────────────────────────────────────────────────────

/*
 * 1) Diagnosis — what's actually wrong with the query above, and why?
 *  The LEFT JOIN clause merges all customers with confirmed, pending, and null
 *  value on their booking. Then running the JOINED table into another WHERE
 *  clause causes the output to be filtered only for 'confirmed' booking. Which
 *  results to 4 rows only. It violates the report because it will disregard
 *  also the customers without booking. 
 *
 * 2) Fixed query — paste it below and run it against the DB.
 *
 * SELECT c.first_name, c.last_name, COUNT(b.id) AS confirmed_bookings
 * FROM customers c
 * LEFT JOIN bookings b ON c.id = b.customer_id AND b.status = 'confirmed'
 * GROUP BY c.first_name, c.last_name;
 *
 * 3) Fixed output — paste the actual result here.
 *
 *   first_name   last_name   confirmed_bookings
 *   -----------  ----------  ------------------
 *   Adella       Stanton     1
 *   Alvera       Krajcik     1
 *   Bradford     Gerlach     1
 *   Dixie        Cole        0
 *   Doug         Johns       0
 *   Kristian     Lindgren    0
 *   Ronnie       Bogan       1
 *   Samanta      Terry       0
 *   Sue          Grimes      0
 *   Tami         Crist       0
 *
 *
 * 4) One-sentence answers (per the plan):
 *    - Why does NULL handling matter here?
 *        A LEFT JOIN represents no match as NULL, pairing it with the WHERE
 *        clause carelessly would silently drop the no-match rows the initial
 *        join was meant to keep.
 *
 *    - What do COUNT(*) vs COUNT(column) return on a null-extended row?
 *        The COUNT (*) returns 1 even if it is null and COUNT(column) counts only the
 *        populated column.
 */
