# Day 8 — Server State: TanStack Query

Source: `ethanpatrickbandebas-training-plan.html` — Wed · W2 · Day 8

## Activities (all required today, per the plan)

- [x] Pre-read (~30m): `primer-tanstack-query-concepts.md` (EM-sent, mandatory before coding) — `deliverables/day8/files/primer-tanstack-query-concepts.md`
- [x] Wire slot fetching through `useQuery` — `app.queue-booking/hooks/use-slots.ts` (`fetchSlots` from `lib/api/slots.ts`), consumed by `booking-form.tsx`
- [x] Wire booking creation through `useMutation` with invalidation — `hooks/use-create-booking.ts` (`createBooking` from `lib/api/bookings.ts`), `onSuccess` invalidates the `['slots']` prefix
- [x] Demo: create a booking → cache invalidates → slots list refetches — `deliverables/day8/files/invalidation-proof.md` (network-level proof, no browser in this environment) **and** confirmed live through the actual UI at `localhost:3000` (3 real bookings made; `GET /slots?available=true` count tracked correctly, 7 → 4)
- [x] Test: mock the API with a fixture, verify mutation success triggers the re-query — `app.queue-booking/app/components/booking-form.test.tsx`
- [x] 2-min English video rep — why cache invalidation matters — https://www.loom.com/share/6d34fbacc2c742ed99ef32da6a1ee27f

## Deliverable (per the plan's Deliverable box)

- [x] TanStack Query wiring + fixture-based mutation test — `app.queue-booking/`
- [x] Video rep — https://www.loom.com/share/6d34fbacc2c742ed99ef32da6a1ee27f
- [x] PR — https://github.com/ebandebasfs/2-week-training-plan/pull/8

## Dependency note

This branch merges in Day 6's branch (PR #6, still open) and is built on top
of Day 7's branch (PR #7, still open). PR #8's diff will look wide until
those two land — it self-resolves to just Day 8's changes once they merge
into master (same commits, no conflict expected). Re-sync this branch against
master before PR #8 merges, in case either picks up more review-round
commits in the meantime.

## EOD email

Use `email.md` in this folder — `status: Done`.
