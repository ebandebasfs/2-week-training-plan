"use client";

import { useEffect, useRef, useState } from "react";
import { availableMockSlots } from "@/data/mock-slots";
import SlotSummary from "./slot-summary";

export default function BookingForm() {
  const [slotId, setSlotId] = useState("");
  const [notes, setNotes] = useState("");

  // Render counter: a ref, not state so that mutating it doesn't schedule another
  // render, so there's no risk of the effect retriggering itself
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ slotId, notes });
  };

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
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="" disabled>
              Select a slot
            </option>
            {availableMockSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.appointmentDate} · {slot.startTime}–{slot.endTime} (Max: {slot.capacity})
              </option>
            ))}
          </select>
        </div>

        <SlotSummary slotId={slotId} slots={availableMockSlots} />

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
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Book slot
        </button>
      </form>
    </div>
  );
}
