import type { Slot } from "@/lib/api/slots";

// Fixture data for the mutation/invalidation test only — not used by app code.
export const fixtureSlots: Slot[] = [
  {
    id: "3f29b2b0-6b1a-4e2a-8b8a-1a2b3c4d5e6f",
    capacity: 4,
    appointmentDate: "2026-08-12",
    startTime: "09:00",
    endTime: "09:30",
    isAvailable: true,
  },
  {
    id: "7c1d4e6a-9f2b-4c3d-8e5f-2b3c4d5e6f7a",
    capacity: 4,
    appointmentDate: "2026-08-12",
    startTime: "09:30",
    endTime: "10:00",
    isAvailable: true,
  },
];

// What GET /slots?available=true returns after fixtureSlots[0] gets booked.
export const fixtureSlotsAfterBooking: Slot[] = fixtureSlots.slice(1);
