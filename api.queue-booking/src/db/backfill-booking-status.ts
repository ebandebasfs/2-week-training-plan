import { AppDataSource } from './data-source';

const BATCH_SIZE = 100;

async function backfillBookingStatus() {
    await AppDataSource.initialize();

    let backfilled = 0;

    while (true) {
        const rows: { id: string }[] = await AppDataSource.query(
            `SELECT TOP (@0) id FROM bookings WHERE booking_status IS NULL`,
            [BATCH_SIZE],
        );

        if (rows.length === 0) break;

        const ids = rows.map((r) => r.id);
        const placeholders = ids.map((_, i) => `@${i}`).join(', ');

        await AppDataSource.query(
            `UPDATE bookings SET booking_status = 'confirmed' WHERE id IN (${placeholders})`,
            ids,
        );

        backfilled += rows.length;
        console.log(`Backfilled ${backfilled} rows...`);

        // Small delay between batches so a large table doesn't get hammered back-to-back.
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Backfill complete: ${backfilled} rows set to booking_status = 'confirmed'`);
    await AppDataSource.destroy();
}

backfillBookingStatus().catch((err) => {
    console.error(err);
    process.exit(1);
});
