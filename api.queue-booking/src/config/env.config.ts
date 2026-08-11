import { env } from "./env-schema.config";

export const envConfig = () => ({
    ports: {
        server: env.PORT
    },
    db: {
        url: env.DATABASE_URL
    },
    cors: {
        origin: env.CORS_ORIGIN
    },
})
