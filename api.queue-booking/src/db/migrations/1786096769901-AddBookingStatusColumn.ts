import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingStatusColumn1786096769901 implements MigrationInterface {
    name = 'AddBookingStatusColumn1786096769901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD "booking_status" nvarchar(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "booking_status"`);
    }

}
