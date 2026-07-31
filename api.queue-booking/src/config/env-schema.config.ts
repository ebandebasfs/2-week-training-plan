import 'dotenv/config'
import z from "zod";

// Create a schema to be use for parsing or validation of env
const envSchema = z.object({
    PORT: z.string()
        .transform((val) => Number(val))
        .pipe(z.number().int().positive())
        .default(3000),
    DATABASE_URL: z.string().min(1),
})

// Run validation and get the validated object
export const env = envSchema.parse(process.env);
