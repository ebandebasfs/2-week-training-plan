import { API_BASE_URL, parseJsonOrThrow } from "./client";

// Mirrors the API's Slot entity (api.queue-booking/src/db/entities/slot.entity.ts).
export interface Slot {
  id: string;
  capacity: number;
  appointmentDate: string; // ISO date, e.g. "2026-08-12"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  isAvailable: boolean;
}

export async function fetchSlots({ available = true }: { available?: boolean } = {}): Promise<Slot[]> {
  const res = await fetch(`${API_BASE_URL}/slots?available=${available}`);
  return parseJsonOrThrow(res);
}
