import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntitySchema } from "./base.entity";
import { Booking } from "./booking.entity";

@Entity('slots')
export class Slot extends BaseEntitySchema {
    @Column()
    capacity!: number;

    @Column({ name: 'appointment_date', type: 'date' })
    appointmentDate!: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    @Column({ name: 'is_available', default: true })
    isAvailable!: boolean;

    @OneToOne(() => Booking, (booking) => booking.slot)
    booking!: Booking | null;
}