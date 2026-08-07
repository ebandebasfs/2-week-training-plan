import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Day 6 index drill: this index already exists (added in InitSchema, driven by
 * the @Index() on Booking.customer). Dropping and recreating it here isn't a
 * real schema change — it's how we get real "before/after" timing numbers for
 * the runbook, since the index was already in place before this drill started.
 */
export class DropCustomerIdIndex1786097092932 implements MigrationInterface {
    name = 'DropCustomerIdIndex1786097092932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings" ("customer_id")`);
    }

}
