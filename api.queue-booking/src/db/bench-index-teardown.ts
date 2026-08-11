import { AppDataSource } from './data-source';

// Removes everything bench-index-seed.ts created (bookings, slots, and the
// dummy customers), by marker — leaves the real Day 1 seed data (10/15/8)
// untouched.
const BENCH_MARKER_DATE = '1900-01-01';
const BENCH_EMAIL_DOMAIN = 'bench.local';

async function teardownBench() {
    await AppDataSource.initialize();

    try {
        // Safety net: bench-index-seed.ts drops the index for STEP A. If STEP B (the
        // "with index" measurement, which recreates it) was skipped, guarantee the index
        // is back before we're done rather than leaving the real table unindexed.
        const [{ indexExists }] = await AppDataSource.query(
            `SELECT CASE WHEN EXISTS (
                SELECT 1 FROM sys.indexes WHERE name = 'idx_bookings_customer_id' AND object_id = OBJECT_ID('bookings')
            ) THEN 1 ELSE 0 END AS indexExists`,
        );
        if (!indexExists) {
            await AppDataSource.query(`CREATE INDEX "idx_bookings_customer_id" ON "bookings" ("customer_id")`);
            console.log('Recreated customer_id index (was left dropped from the benchmark).');
        }

        await AppDataSource.query(
            `DELETE FROM bookings WHERE slot_id IN (SELECT id FROM slots WHERE appointment_date = @0)`,
            [BENCH_MARKER_DATE],
        );
        await AppDataSource.query(
            `DELETE FROM slots WHERE appointment_date = @0`,
            [BENCH_MARKER_DATE],
        );
        await AppDataSource.query(
            `DELETE FROM customers WHERE email LIKE '%@' + @0`,
            [BENCH_EMAIL_DOMAIN],
        );

        const [{ remaining }] = await AppDataSource.query(
            `SELECT COUNT(*) AS remaining FROM slots WHERE appointment_date = @0`,
            [BENCH_MARKER_DATE],
        );
        console.log(`Teardown complete — bench rows remaining: ${remaining} (should be 0)`);
    } finally {
        await AppDataSource.destroy();
    }
}

teardownBench().catch((err) => {
    console.error(err);
    process.exit(1);
});
