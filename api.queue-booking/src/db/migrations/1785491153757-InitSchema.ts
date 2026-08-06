import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1785491153757 implements MigrationInterface {
    name = 'InitSchema1785491153757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "slots" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_8b553bb1941663b63fd38405e42" DEFAULT NEWSEQUENTIALID(), "created_at" datetime2 NOT NULL CONSTRAINT "DF_7cfe29d014c5d8f06eb249073ad" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_b9888a788f7258e1e3335cd4e75" DEFAULT getdate(), "capacity" int NOT NULL, "appointment_date" date NOT NULL, "start_time" time NOT NULL, "end_time" time NOT NULL, "is_available" bit NOT NULL CONSTRAINT "DF_d29a7d44491ca50c2793303cdd3" DEFAULT 1, CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_bee6805982cc1e248e94ce94957" DEFAULT NEWSEQUENTIALID(), "created_at" datetime2 NOT NULL CONSTRAINT "DF_3411322e212076d1ac1a71e6ed0" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_8e00f584190ec9beea75a918189" DEFAULT getdate(), "status" nvarchar(20) NOT NULL CONSTRAINT "DF_48b267d894e32a25ebde4b207a2" DEFAULT 'pending', "notes" nvarchar(255), "customer_id" uniqueidentifier NOT NULL, "slot_id" uniqueidentifier NOT NULL, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings" ("customer_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_409d5b76fb2b0501a8c72dd4ee" ON "bookings" ("slot_id") WHERE "slot_id" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_133ec679a801fab5e070f73d3ea" DEFAULT NEWSEQUENTIALID(), "created_at" datetime2 NOT NULL CONSTRAINT "DF_a8fcf679692db1c886e7f15d2ba" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_386a5e03676dab6b7bf4bf020bd" DEFAULT getdate(), "first_name" nvarchar(255) NOT NULL, "last_name" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, "username" nvarchar(255), "password" nvarchar(255) NOT NULL, CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_409d5b76fb2b0501a8c72dd4eeb" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_409d5b76fb2b0501a8c72dd4eeb"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP INDEX "REL_409d5b76fb2b0501a8c72dd4ee" ON "bookings"`);
        await queryRunner.query(`DROP INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "slots"`);
    }

}
