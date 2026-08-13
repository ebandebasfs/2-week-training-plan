import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingStatusNotNull1786096937340 implements MigrationInterface {
    name = 'BookingStatusNotNull1786096937340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "booking_status" nvarchar(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "booking_status" nvarchar(50)`);
    }

}
