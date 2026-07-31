import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModules, InfraModules } from './modules';

@Module({
  imports: [...InfraModules, ...AppModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
