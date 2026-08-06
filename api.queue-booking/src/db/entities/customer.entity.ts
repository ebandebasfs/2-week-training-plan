import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntitySchema } from "./base.entity";
import { Booking } from "./booking.entity";

@Entity('customers')
export class Customer extends BaseEntitySchema {
    @Column({ name: 'first_name' })
    firstName!: string;

    @Column({ name: 'last_name' })
    lastName!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ type: 'nvarchar', nullable: true })
    username!: string | null

    @Column()
    password!: string;

    @OneToMany(() => Booking, (booking) => booking.customer)
    bookings!: Booking[]; 
}