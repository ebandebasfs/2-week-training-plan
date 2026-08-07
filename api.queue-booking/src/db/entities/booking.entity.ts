import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntitySchema } from "./base.entity";
import { Customer } from "./customer.entity";
import { Slot } from "./slot.entity";

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled'
}

@Entity('bookings')
@Check(`[status] IN ('pending', 'confirmed', 'cancelled')`)
export class Booking extends BaseEntitySchema {
    @Index()
    @ManyToOne(() => Customer, (customer) => customer.bookings, {nullable: false})
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;

    @OneToOne(() => Slot, (slot) => slot.booking, { nullable: false })
    @JoinColumn({ name: 'slot_id' })
    slot!: Slot;

    @Column({type: 'nvarchar', length: 20, default: BookingStatus.PENDING})
    status!: BookingStatus;

    @Column({ type: 'nvarchar', nullable: true })
    notes!: string | null;

    // Added for Week 2 Day 1 — drill column, distinct from `status` above (see runbook note)
    @Column({ name: 'booking_status', type: 'nvarchar', length: 50, nullable: false })
    bookingStatus!: string
}