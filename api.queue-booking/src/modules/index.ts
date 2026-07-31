import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "src/config/env.config"

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

]
