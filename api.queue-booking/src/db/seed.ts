import { faker } from '@faker-js/faker';
import { AppDataSource } from './data-source';
import { Customer } from './entities/customer.entity';
import { Slot } from './entities/slot.entity';
import { Booking, BookingStatus } from './entities/booking.entity';

const CUSTOMER_COUNT = 10;
const SLOT_COUNT = 15;
const BOOKING_COUNT = 8;

async function seed() {
    await AppDataSource.initialize();

    const customerRepo = AppDataSource.getRepository(Customer);
    const slotRepo = AppDataSource.getRepository(Slot);
    const bookingRepo = AppDataSource.getRepository(Booking);

    const customers = await customerRepo.save(
        Array.from({ length: CUSTOMER_COUNT }, () => {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            return customerRepo.create({
                firstName,
                lastName,
                email: faker.internet.email({ firstName, lastName }).toLowerCase(),
                password: faker.internet.password(),
            });
        }),
    );

    const slots = await slotRepo.save(
        Array.from({ length: SLOT_COUNT }, () => {
            const appointmentDate = faker.date.soon({ days: 14 });
            const startHour = faker.number.int({ min: 8, max: 16 });
            return slotRepo.create({
                capacity: 1,
                appointmentDate,
                startTime: `${String(startHour).padStart(2, '0')}:00:00`,
                endTime: `${String(startHour).padStart(2, '0')}:30:00`,
            });
        }),
    );

    const shuffledSlots = faker.helpers.shuffle(slots).slice(0, BOOKING_COUNT);

    await bookingRepo.save(
        shuffledSlots.map((slot) =>
            bookingRepo.create({
                customer: faker.helpers.arrayElement(customers),
                slot,
                status: faker.helpers.arrayElement(Object.values(BookingStatus)),
                // NOT NULL, no DB default (see booking.entity.ts) — mirror `status`.
                bookingStatus: BookingStatus.PENDING,
                notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
            }),
        ),
    );

    // A booked slot is no longer available (previously missing here).
    await slotRepo.save(
        shuffledSlots.map((slot) => slotRepo.create({ ...slot, isAvailable: false })),
    );

    console.log(`Seed complete: ${customers.length} customers, ${slots.length} slots, ${shuffledSlots.length} bookings`);
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
