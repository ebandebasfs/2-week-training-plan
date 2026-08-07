import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source';

// Day 6 index-timing drill: bulk-seeds real bookings/slots/customers rows so
// the customer_id index has enough data — and enough selectivity — to
// actually matter. Bookings are spread across many dummy customers, not one,
// so a WHERE customer_id = X lookup matches a handful of rows out of 200k,
// not nearly the whole table (an unselective filter gains nothing from an
// index, which is what the first version of this script accidentally tested).
// Tagged (marker email domain / appointment_date) so
// bench-index-teardown.ts can remove them precisely — never touches the
// real Day 1 seed data (10/15/8).
const BENCH_ROW_COUNT = 200_000;
const BENCH_CUSTOMER_COUNT = 20_000;
const BENCH_MARKER_DATE = '1900-01-01';
const BENCH_EMAIL_DOMAIN = 'bench.local';
const BATCH_SIZE = 1000;

async function seedBench() {
    await AppDataSource.initialize();

    // 1) Dummy customers, tagged by email domain
    const customerIds: string[] = [];
    for (let inserted = 0; inserted < BENCH_CUSTOMER_COUNT; inserted += BATCH_SIZE) {
        const batch = Math.min(BATCH_SIZE, BENCH_CUSTOMER_COUNT - inserted);
        const rows: string[] = [];

        for (let i = 0; i < batch; i++) {
            const id = randomUUID();
            customerIds.push(id);
            const n = inserted + i;
            rows.push(
                `('${id}', 'Bench', 'Customer', 'bench+${n}@${BENCH_EMAIL_DOMAIN}', 'bench-password')`,
            );
        }

        await AppDataSource.query(
            `INSERT INTO customers (id, first_name, last_name, email, password) VALUES ${rows.join(', ')}`,
        );
        console.log(`Seeded ${inserted + batch} / ${BENCH_CUSTOMER_COUNT} bench customers...`);
    }

    // 2) Slots + bookings, round-robin across the dummy customers
    for (let inserted = 0; inserted < BENCH_ROW_COUNT; inserted += BATCH_SIZE) {
        const batch = Math.min(BATCH_SIZE, BENCH_ROW_COUNT - inserted);
        const slotIds = Array.from({ length: batch }, () => randomUUID());

        const slotRows = slotIds
            .map((id) => `('${id}', 1, '${BENCH_MARKER_DATE}', '09:00:00', '09:30:00', 1)`)
            .join(', ');
        await AppDataSource.query(
            `INSERT INTO slots (id, capacity, appointment_date, start_time, end_time, is_available) VALUES ${slotRows}`,
        );

        const bookingRows = slotIds
            .map((slotId, i) => {
                const customerId = customerIds[(inserted + i) % customerIds.length];
                return `('${customerId}', '${slotId}', 'confirmed')`;
            })
            .join(', ');
        await AppDataSource.query(
            `INSERT INTO bookings (customer_id, slot_id, booking_status) VALUES ${bookingRows}`,
        );

        console.log(`Seeded ${inserted + batch} / ${BENCH_ROW_COUNT} bench bookings...`);
    }

    console.log(`Bench seed complete. Use this customer_id for the benchmark query: ${customerIds[0]}`);
    console.log(`(It has ~${Math.round(BENCH_ROW_COUNT / BENCH_CUSTOMER_COUNT)} bookings out of ${BENCH_ROW_COUNT} total — a selective filter.)`);
    await AppDataSource.destroy();
}

seedBench().catch((err) => {
    console.error(err);
    process.exit(1);
});
