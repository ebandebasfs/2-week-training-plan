import { env } from "../config/env-schema.config";
import { DataSource } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { Slot } from "./entities/slot.entity";
import { Booking } from "./entities/booking.entity";

export const AppDataSource = new DataSource({
    type: 'mssql',
    url: env.DATABASE_URL,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    entities: [Customer, Slot, Booking],
    migrations: [`src/db/migrations/*.ts`],
    synchronize: false
})