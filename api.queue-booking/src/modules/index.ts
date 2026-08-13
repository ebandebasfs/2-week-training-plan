import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "src/config/env.config"
import { SlotsModule } from "./slots/slots.module"
import { CustomersModule } from "./customers/customers.module"
import { BookingsModule } from "./bookings/bookings.module"

export const InfraModules = [
    ConfigModule.forRoot({
        isGlobal: true,
        load: [envConfig]
    }),
    TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            type: 'mssql',
            url: config.getOrThrow<string>('db.url'),
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
            autoLoadEntities: true,
            synchronize: false,
        }),
    }),
]

export const AppModules = [
    SlotsModule,
    CustomersModule,
    BookingsModule,
]
