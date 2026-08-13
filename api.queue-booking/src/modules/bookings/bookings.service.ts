import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../../db/entities/booking.entity';
import { Slot } from '../../db/entities/slot.entity';
import { Customer } from '../../db/entities/customer.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Slot) private readonly slotRepo: Repository<Slot>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  // Day 8 scope only: naive read-check-write, no transaction/lock — two
  // concurrent requests can both pass the isAvailable check. Day 9 closes
  // this with UPDLOCK/HOLDLOCK + a unique constraint.
  async create(dto: CreateBookingDto): Promise<Booking> {
    const slot = await this.slotRepo.findOneBy({ id: dto.slotId });
    if (!slot) {
      throw new NotFoundException(`Slot ${dto.slotId} not found`);
    }
    if (!slot.isAvailable) {
      throw new ConflictException(`Slot ${dto.slotId} is already booked`);
    }

    const customer = await this.customerRepo.findOneBy({ id: dto.customerId });
    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    const booking = await this.bookingRepo.save(
      this.bookingRepo.create({
        slot,
        customer,
        notes: dto.notes ?? null,
        // bookingStatus: Day 6's drill column, NOT NULL with no DB default. Mirror `status`.
        bookingStatus: BookingStatus.PENDING,
      }),
    );

    slot.isAvailable = false;
    await this.slotRepo.save(slot);

    return booking;
  }
}
