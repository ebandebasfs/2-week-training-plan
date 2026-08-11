-- Day 6 — index timing drill (customer_id on bookings)
--
-- Run order (terminal steps noted inline):
--
--   1. npm run bench:index-seed        -- adds 200k real bookings/slots rows,
--                                          drops the customer_id index at the end
--   2. run STEP A below, note the ms   -- measures WITHOUT the index
--   3. run the CREATE INDEX in STEP B  -- recreates the index
--   4. run STEP B's SELECT, note the ms -- measures WITH the index
--   5. npm run bench:index-teardown    -- removes the 200k bench rows
--                                          (also recreates the index as a safety
--                                          net if STEP B above was skipped)

SELECT COUNT(*) FROM bookings WHERE booking_status IS NULL; -- expect 0, confirms backfill

SELECT TOP 1 id FROM customers WHERE email LIKE 'bench+%@bench.local';

-- ── STEP A — benchmark WITHOUT the index ──
SET STATISTICS TIME ON;

-- Replace <BENCH_CUSTOMER_ID> with the customer_id printed by: npm run bench:index-seed
SELECT * FROM bookings WHERE customer_id = '<BENCH_CUSTOMER_ID>'; -- 70ms - no indexing

-- ── STEP B — benchmark WITH the index ──
CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id");

SET STATISTICS TIME ON;

SELECT * FROM bookings WHERE customer_id = '<BENCH_CUSTOMER_ID>'; -- 5 ms - with indexing

-- After teardown, confirm real data is untouched (should read 8):
SELECT COUNT(*) FROM bookings;
