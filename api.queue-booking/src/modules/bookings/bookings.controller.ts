import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { createBookingSchema } from './dto/create-booking.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createBookingSchema))
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }
}
