import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitializeApp } from './config/bootstrap.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await InitializeApp(app);
}
bootstrap();
