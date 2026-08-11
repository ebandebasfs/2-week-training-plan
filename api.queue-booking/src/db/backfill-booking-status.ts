import { AppDataSource } from './data-source';

const BATCH_SIZE = 100;

async function backfillBookingStatus() {
    await AppDataSource.initialize();

    let backfilled = 0;

    try {
        while (true) {
            const batchCount: number = await AppDataSource.transaction(async (manager) => {
                // UPDLOCK + READPAST: locks the rows this transaction selects and skips
                // any rows already locked by a concurrent run, so two backfills executing
                // at once can't both grab the same batch and double-process it.
                const rows: { id: string }[] = await manager.query(
                    `SELECT TOP (@0) id FROM bookings WITH (UPDLOCK, READPAST) WHERE booking_status IS NULL`,
                    [BATCH_SIZE],
                );

                if (rows.length === 0) return 0;

                const ids = rows.map((r) => r.id);
                const placeholders = ids.map((_, i) => `@${i}`).join(', ');

                await manager.query(
                    `UPDATE bookings SET booking_status = 'confirmed' WHERE id IN (${placeholders})`,
                    ids,
                );

                return rows.length;
            });

            if (batchCount === 0) break;

            backfilled += batchCount;
            console.log(`Backfilled ${backfilled} rows...`);

            // Small delay between batches so a large table doesn't get hammered back-to-back.
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(`Backfill complete: ${backfilled} rows set to booking_status = 'confirmed'`);
    } finally {
        await AppDataSource.destroy();
    }
}

backfillBookingStatus().catch((err) => {
    console.error(err);
    process.exit(1);
});
