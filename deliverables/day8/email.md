Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 8 (Wed W2) — TanStack Query Wiring + Fixture-Based Mutation Test

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 8 (Wed W2)
track: React
deliverable_expected: TanStack Query wiring + fixture-based mutation test · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/8
extra_links: `deliverables/day8/files/invalidation-proof.md`, `deliverables/day8/files/primer-tanstack-query-concepts.md`, video rep https://www.loom.com/share/6d34fbacc2c742ed99ef32da6a1ee27f
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Wired the booking form to real server state: `useSlots()` (`useQuery`) fetches available slots, `useCreateBooking()` (`useMutation`) posts a new booking and invalidates the `['slots']` prefix on success.
   - Backend didn't have slots/bookings endpoints yet, so built the minimum `GET /api/slots` and `POST /api/bookings` needed to unblock this — naive on purpose, no transaction/lock (that's Day 9).
   - Wrote a Vitest test that mocks the API with a fixture and asserts the mutation's success triggers a real re-fetch, not a manual cache poke.
   - Proved the invalidation loop end-to-end against the live API + DB (GET → POST → GET, booked slot disappears), then confirmed it again by driving the actual UI at `localhost:3000`.
   - Found and fixed a pre-existing seed bug along the way: booked slots were never marked unavailable, so the "available" endpoint was serving already-booked slots.
   - Video rep: https://www.loom.com/share/6d34fbacc2c742ed99ef32da6a1ee27f

2) Evidence / how to verify
   - Query/mutation hooks: `app.queue-booking/hooks/use-slots.ts`, `hooks/use-create-booking.ts`
   - API client: `lib/api/slots.ts`, `lib/api/bookings.ts`
   - Test: `app.queue-booking/app/components/booking-form.test.tsx` (`npm run test`)
   - Invalidation proof: `deliverables/day8/files/invalidation-proof.md`
   - Backend endpoints: `api.queue-booking/src/modules/slots/`, `.../modules/bookings/`
   - Video rep: https://www.loom.com/share/6d34fbacc2c742ed99ef32da6a1ee27f
   - PR #8: https://github.com/ebandebasfs/2-week-training-plan/pull/8
   - Full writeup + scope notes: `deliverables/day8/README.md`

3) Blockers (or "None")
   - PR #8 merges into a partly-unmerged base (Day 6's PR #6 and Day 7's PR #7 are both still open) — flagged in the PR description, expected to self-resolve once those land.

4) Tomorrow
   - Day 9 — THE MONEY DAY: transaction-safe `POST /bookings` with `UPDLOCK`/`HOLDLOCK`, unique constraint, and the concurrent 201+409 proof. Builds directly on today's naive version.

5) Questions for EM (optional, or "None")
   - None.
