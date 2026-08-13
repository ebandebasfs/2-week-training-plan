import { Controller, Get, Query } from '@nestjs/common';
import { SlotsService } from './slots.service';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  findAll(@Query('available') available?: string) {
    if (available === 'true') {
      return this.slotsService.findAvailable();
    }
    return this.slotsService.findAll();
  }
}
