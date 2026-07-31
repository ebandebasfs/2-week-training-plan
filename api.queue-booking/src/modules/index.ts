import { ConfigModule } from "@nestjs/config"
import { envConfig } from "src/config/env.config"

export const InfraModules = [
    ConfigModule.forRoot({
        isGlobal: true,
        load: [envConfig]
    }),
]

export const AppModules = [

]
