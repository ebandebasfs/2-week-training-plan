"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";
import type { Slot } from "@/lib/api/slots";
import { useSlots } from "@/hooks/use-slots";
import { useCreateBooking } from "@/hooks/use-create-booking";
import SlotSummary from "./slot-summary";

// No auth/customer-selection UI yet — pinned to one seeded customer. See .env.sample.
const DEMO_CUSTOMER_ID = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ?? "";
if (!DEMO_CUSTOMER_ID) {
  throw new Error(
    "NEXT_PUBLIC_DEMO_CUSTOMER_ID is not set. Check app.queue-booking/.env.sample.",
  );
}

// Stable reference so `slots={slots}` doesn't break SlotSummary's React.memo
// while slotsQuery is loading (a fresh `[]` literal would be a new array every render).
const EMPTY_SLOTS: Slot[] = [];

export default function BookingForm() {
  const [slotId, setSlotId] = useState("");
  const [notes, setNotes] = useState("");

  // Render counter: a ref, not state so that mutating it doesn't schedule another
  // render, so there's no risk of the effect retriggering itself
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  const slotsQuery = useSlots();
  const createBookingMutation = useCreateBooking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) return;
    createBookingMutation.mutate(
      { slotId, customerId: DEMO_CUSTOMER_ID, notes: notes || undefined },
      { onSuccess: () => { setSlotId(""); setNotes(""); } },
    );
  };

  const slots = slotsQuery.data ?? EMPTY_SLOTS;

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Book a slot</h1>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
          Renders: {renderCount.current}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slotId" className="text-sm font-medium text-zinc-700">
            Slot
          </label>
          <select
            id="slotId"
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            disabled={slotsQuery.isLoading}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="" disabled>
              {slotsQuery.isLoading ? "Loading slots…" : "Select a slot"}
            </option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.appointmentDate} · {slot.startTime}–{slot.endTime} (Max: {slot.capacity})
              </option>
            ))}
          </select>
          {slotsQuery.isError && (
            <p className="text-xs text-red-600">Couldn&apos;t load slots: {(slotsQuery.error as Error).message}</p>
          )}
        </div>

        <SlotSummary slotId={slotId} slots={slots} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={!slotId || createBookingMutation.isPending}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createBookingMutation.isPending ? "Booking…" : "Book slot"}
        </button>

        {createBookingMutation.isSuccess && (
          <p className="text-sm text-emerald-600">Booked. The slot list above just refetched and invalidated.</p>
        )}
        {createBookingMutation.isError && (
          <p className="text-sm text-red-600">
            {createBookingMutation.error instanceof ApiError && createBookingMutation.error.status === 409
              ? "That slot was just taken. Pick another."
              : `Booking failed: ${(createBookingMutation.error as Error).message}`}
          </p>
        )}
      </form>
    </div>
  );
}
