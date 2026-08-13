import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// BookingForm fails fast at module load if this is unset (see booking-form.tsx) —
// give it a value here so component tests exercise the real code path instead of
// tripping the guard.
process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ||= "00000000-0000-0000-0000-000000000000";

afterEach(() => {
  cleanup();
});
