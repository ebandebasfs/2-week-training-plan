-- Day 6 — index timing drill (customer_id on bookings)
--
-- Run order (terminal steps noted inline):
--
--   1. npm run bench:index-seed        -- adds 200k real bookings/slots rows
--   2. npm run migration:run           -- drops the customer_id index
--        (DropCustomerIdIndex1786097092932)
--   3. run STEP A below, note the ms
--   4. npm run migration:revert        -- recreates the index
--   5. run STEP B below, note the ms
--   6. npm run bench:index-teardown    -- removes the 200k bench rows

SELECT COUNT(*) FROM bookings WHERE booking_status IS NULL; -- expect 0, confirms backfill

SELECT TOP 1 id FROM customers WHERE email LIKE 'bench+%@bench.local';

-- ── STEP A — benchmark WITHOUT the index ──
SET STATISTICS TIME ON;

SELECT * FROM bookings WHERE customer_id = '3BEC6FF1-FD1C-42B4-8450-91DCEE321C86'; -- 70ms - no indexing

-- STEP B — benchmark WITH the index (after migration:revert)
SET STATISTICS TIME ON;

SELECT * FROM bookings WHERE customer_id = '3BEC6FF1-FD1C-42B4-8450-91DCEE321C86'; -- 5 ms - with indexing

-- After teardown, confirm real data is untouched (should read 8):
SELECT COUNT(*) FROM bookings;
