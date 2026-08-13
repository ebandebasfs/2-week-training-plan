"use client";

import { memo, useEffect, useRef } from "react";
import type { Slot } from "@/data/mock-slots";

interface SlotSummaryProps {
  slotId: string;
  slots: Slot[];
}

function SlotSummaryBase({ slotId, slots }: SlotSummaryProps) {
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
  });

  const slot = slots.find((s) => s.id === slotId);

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-zinc-700">Selected slot</span>
        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-500">
          Renders: {renderCount.current}
        </span>
      </div>
      {slot ? (
        <p className="text-zinc-600">
          {slot.appointmentDate} · {slot.startTime}–{slot.endTime} · Max {slot.capacity}
        </p>
      ) : (
        <p className="text-zinc-400">No slot selected yet</p>
      )}
    </div>
  );
}

// Memoized: this only re-renders when slotId or slots actually change —
// typing in the notes field re-renders BookingForm but not this component,
// since its props stay referentially the same. That gap (its counter stays
// flat while BookingForm's climbs) is the Day 7 memoization evidence.
export default memo(SlotSummaryBase);
