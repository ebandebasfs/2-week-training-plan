import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Gives the customer_id index (Day 1's InitSchema, driven by @Index() on
 * Booking.customer) a stable, human-readable name instead of relying on
 * TypeORM's auto-generated hash. The hash regenerates — and silently breaks
 * any hard-coded reference to it (bench scripts, drill SQL) — if the
 * Booking/Customer relationship definition ever changes.
 */
export class RenameCustomerIdIndex1786097300000 implements MigrationInterface {
    name = 'RenameCustomerIdIndex1786097300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`EXEC sp_rename 'bookings.IDX_8e21b7ae33e7b0673270de4146', 'idx_bookings_customer_id', 'INDEX'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`EXEC sp_rename 'bookings.idx_bookings_customer_id', 'IDX_8e21b7ae33e7b0673270de4146', 'INDEX'`);
    }

}
