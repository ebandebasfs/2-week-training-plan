import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../../db/entities/slot.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private readonly slotRepo: Repository<Slot>,
  ) {}

  findAll(): Promise<Slot[]> {
    return this.slotRepo.find({
      order: { appointmentDate: 'ASC', startTime: 'ASC' },
    });
  }

  findAvailable(): Promise<Slot[]> {
    return this.slotRepo.find({
      where: { isAvailable: true },
      order: { appointmentDate: 'ASC', startTime: 'ASC' },
    });
  }
}
