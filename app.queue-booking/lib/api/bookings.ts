import { API_BASE_URL, parseJsonOrThrow } from "./client";
import type { Slot } from "./slots";

// Mirrors the API's Booking entity (api.queue-booking/src/db/entities/booking.entity.ts).
export interface Booking {
  id: string;
  slot: Slot;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
}

export interface CreateBookingPayload {
  slotId: string;
  customerId: string;
  notes?: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res);
}
