import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../db/entities/booking.entity';
import { Slot } from '../../db/entities/slot.entity';
import { Customer } from '../../db/entities/customer.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Slot, Customer])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
