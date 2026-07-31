import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export async function InitializeApp(app: INestApplication) {
    app.setGlobalPrefix('api');

    const config = app.get(ConfigService);
    const PORT = config.getOrThrow<number>('ports.server');

    await app.listen(PORT);

    Logger.log(`Server listening: http://localhost:${PORT}`, 'Bootstrap');
}
