import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingStatusCheck1785722214665 implements MigrationInterface {
    name = 'AddBookingStatusCheck1785722214665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "CHK_7fb018b1f6e075be6f2344e910" CHECK ([status] IN ('pending', 'confirmed', 'cancelled'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "CHK_7fb018b1f6e075be6f2344e910"`);
    }

}
