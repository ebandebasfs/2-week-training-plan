"use client";

import { useEffect, useState } from "react";

export default function QueueTicket() {
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);

  // Random value assigned post-mount, so it can't run during either render pass.
  useEffect(() => {
    setTicketNumber(Math.floor(Math.random() * 9000) + 1000);
  }, []);

  // Fixed. Swap the comment to reproduce the hydration mismatch.
  const displayValue = ticketNumber;
  // const displayValue = Math.floor(Math.random() * 9000) + 1000; // bug

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
      <span className="font-medium text-zinc-700">Your queue ticket: </span>
      <span className="font-mono text-zinc-900">
        {displayValue === null ? "—" : `#${displayValue}`}
      </span>
    </div>
  );
}
