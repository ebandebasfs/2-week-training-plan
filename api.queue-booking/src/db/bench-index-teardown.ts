import { AppDataSource } from './data-source';

// Removes everything bench-index-seed.ts created (bookings, slots, and the
// dummy customers), by marker — leaves the real Day 1 seed data (10/15/8)
// untouched.
const BENCH_MARKER_DATE = '1900-01-01';
const BENCH_EMAIL_DOMAIN = 'bench.local';

async function teardownBench() {
    await AppDataSource.initialize();

    await AppDataSource.query(
        `DELETE FROM bookings WHERE slot_id IN (SELECT id FROM slots WHERE appointment_date = '${BENCH_MARKER_DATE}')`,
    );
    await AppDataSource.query(`DELETE FROM slots WHERE appointment_date = '${BENCH_MARKER_DATE}'`);
    await AppDataSource.query(`DELETE FROM customers WHERE email LIKE '%@${BENCH_EMAIL_DOMAIN}'`);

    const [{ remaining }] = await AppDataSource.query(
        `SELECT COUNT(*) AS remaining FROM slots WHERE appointment_date = '${BENCH_MARKER_DATE}'`,
    );
    console.log(`Teardown complete — bench rows remaining: ${remaining} (should be 0)`);

    await AppDataSource.destroy();
}

teardownBench().catch((err) => {
    console.error(err);
    process.exit(1);
});
