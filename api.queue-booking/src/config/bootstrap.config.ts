import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export async function InitializeApp(app: INestApplication) {
    app.setGlobalPrefix('api');

    const config = app.get(ConfigService);
    const PORT = config.getOrThrow<number>('ports.server');

    // The Next.js dev server (app.queue-booking) calls this API cross-origin.
    app.enableCors({ origin: config.getOrThrow<string>('cors.origin') });

    await app.listen(PORT);

    Logger.log(`Server listening: http://localhost:${PORT}`, 'Bootstrap');
}
