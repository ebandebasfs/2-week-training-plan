/**
 * Temporary mock data for the Day 7 booking form.
 *
 * Shape mirrors the API's `Slot` entity (api.queue-booking/src/db/entities/slot.entity.ts)
 * as it would come back over JSON — camelCase fields, `id` as a uuid string.
 *
 * Day 8 replaces this with a real `useQuery` fetch against the slots endpoint.
 * Don't wire this up to anything real before then.
 */

export interface Slot {
  id: string;
  capacity: number;
  appointmentDate: string; // ISO date, e.g. "2026-08-12"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
}

export const mockSlots: Slot[] = [
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
  {
    id: "a4e8f1c2-3d5b-4a6c-9e7f-4d5e6f7a8b9c",
    capacity: 2,
    appointmentDate: "2026-08-12",
    startTime: "10:00",
    endTime: "10:30",
    isAvailable: false,
  },
  {
    id: "e6f7a8b9-c0d1-4e2f-8a3b-5e6f7a8b9c0d",
    capacity: 4,
    appointmentDate: "2026-08-13",
    startTime: "13:00",
    endTime: "13:30",
    isAvailable: true,
  },
  {
    id: "1b2c3d4e-5f6a-4b7c-8d9e-6f7a8b9c0d1e",
    capacity: 1,
    appointmentDate: "2026-08-13",
    startTime: "13:30",
    endTime: "14:00",
    isAvailable: false,
  },
];

export const availableMockSlots = mockSlots.filter((slot) => slot.isAvailable);
