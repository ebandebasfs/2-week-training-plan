import { env } from "./env-schema.config";

export const envConfig = () => ({
    ports: {
        server: env.PORT
    },
})
