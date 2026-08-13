import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UnitOfWork } from '../../common/unit-of-work';
import { Booking, BookingStatus } from '../../db/entities/booking.entity';
import { Slot } from '../../db/entities/slot.entity';
import { Customer } from '../../db/entities/customer.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

// SQL Server error numbers for a violated unique constraint/index. 2627 is a
// named UNIQUE/PK constraint; 2601 is a duplicate key on a unique index —
// which is exactly what bookings.slot_id has (REL_409d5b76fb2b0501a8c72dd4ee,
// the index TypeORM generated for the Slot<->Booking OneToOne join column).
const SQL_UNIQUE_VIOLATION_NUMBERS = new Set([2627, 2601]);

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const { number } = err.driverError as { number?: number };
  return SQL_UNIQUE_VIOLATION_NUMBERS.has(number ?? 0);
}

@Injectable()
export class BookingsService {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    return this.unitOfWork.run(async (manager) => {
      // Exceptions thrown here auto-rollback the transaction (TypeORM behavior).
      const slot = await manager.findOne(Slot, {
        where: { id: dto.slotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot) {
        throw new NotFoundException(`Slot ${dto.slotId} not found`);
      }

      if (!slot.isAvailable) {
        throw new ConflictException(`Slot ${dto.slotId} is already booked`);
      }

      const customer = await manager.findOneBy(Customer, {
        id: dto.customerId,
      });

      if (!customer) {
        throw new NotFoundException(`Customer ${dto.customerId} not found`);
      }

      let booking: Booking;
      try {
        booking = await manager.save(
          manager.create(Booking, {
            slot,
            customer,
            notes: dto.notes ?? null,
            // bookingStatus: Day 6's drill column, NOT NULL with no DB default. Mirror `status`.
            bookingStatus: BookingStatus.PENDING,
          }),
        );
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new ConflictException(`Slot ${dto.slotId} is already booked`);
        }
        throw err;
      }

      slot.isAvailable = false;
      await manager.save(slot);

      return booking;
    });
  }
}
