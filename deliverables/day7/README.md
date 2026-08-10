# Day 7 — React: Controlled Components & the Render Model

Source: `ethanpatrickbandebas-training-plan.html` — Tue · W2 · Day 7

## Activities (all required today, per the plan)

- [x] Course (~1.5h): React 18 Fundamentals — rendering + controlled-components modules (reference: react.dev "Render and Commit" + "State as a Snapshot" + "Queueing a Series of State Updates")
- [x] Next.js beat (~30m): walk `app.queue-booking`'s App Router structure — which components are server vs client, how the queue page fetches its data; one sentence on why the booking form must be a client component (feeds the Next.js 14 Skill IQ retake) — `deliverables/day7/app-router-walkthrough.md`
- [x] Build the controlled booking form (all inputs fully controlled); add a render counter — see keystroke → re-render; memoize a sub-component and prove the count drops — `app.queue-booking/app/components/booking-form.tsx` + `slot-summary.tsx`
- [x] Hydration drill (~20m): render `Date.now()` in a server component, watch the hydration error fire, fix it client-side — then correct the interview answer: a hydration mismatch is server HTML vs first client render, not "useEffect keeps re-triggering" — `app.queue-booking/app/components/queue-ticket.tsx` + `app/hydration-drill/page.tsx` (used `Math.random()` in place of `Date.now()`, same mechanism: a non-deterministic value evaluated in the render body)
- [x] 2-min English video rep — what re-renders on each keystroke, and why memoization helps — https://www.loom.com/share/b5f321e58c8f4d649a853deea9b9eced

## Deliverable (per the plan's Deliverable box — sent to EM in the EOD email)

- [x] Controlled booking form + render-counter/memo evidence — `app.queue-booking/`
- [x] Video rep — https://www.loom.com/share/b5f321e58c8f4d649a853deea9b9eced
- [x] PR link (plan doc literally says "PR #6" here, reused from Day 6's own deliverable — treating that as a copy-paste artifact and numbering this **PR #7** to match the actual sequence; flag to EM if it matters) — https://github.com/ebandebasfs/2-week-training-plan/pull/7

## EOD email

Use `email.md` in this folder — copy its contents into the EOD submission per the Deliverable Email Template. Fill in the metadata block and evidence links before sending; `status` must be `Done`, `Partial`, or `Blocked`.
