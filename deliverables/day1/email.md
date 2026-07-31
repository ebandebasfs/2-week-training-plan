Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 1 (Mon W1) — Baselines & Project Setup

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 1 (Mon W1)
track: All Tracks
deliverable_expected: Skill IQ baseline scores (x4) + repo link + schema diagram sent to EM
deliverable_type: File
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan
extra_links: https://github.com/ebandebasfs/2-week-training-plan/pull/1
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Took all four Skill IQ baselines (TypeScript, React 18, Next.js 14, SQL Essentials) before opening any course material.
   - Scaffolded `api.queue-booking` (NestJS) with TypeORM wired to a Dockerized SQL Server instance, opened as PR #1 with branch protection (PR-only, 1 required review, admins not exempt) enforced on `master`.
   - Modeled `Customer`, `Slot`, and `Booking` entities and generated/ran the initial migration; `slot_id` is a unique FK, enforcing at most one booking per slot at the schema level.
   - Seeded the database with 10 customers, 15 slots, and 8 bookings using Faker (`npm run seed`), leaving some slots open for the Week 2 concurrency test.
   - Added the schema diagram (Mermaid ER) to `api.queue-booking/README.md`.

2) Evidence / how to verify
   - Skill IQ scores: see screenshots in `deliverables/day1/screenshots/` (typescript, react18, nextjs14, sql-assessment.png)
   - PR #1: https://github.com/ebandebasfs/2-week-training-plan/pull/1
   - Migration: `api.queue-booking/src/db/migrations/1785491153757-InitSchema.ts`
   - Seed script: `api.queue-booking/src/db/seed.ts` — ran via `npm run seed`, verified row counts in SQL Server (10 customers / 15 slots / 8 bookings)
   - Schema diagram: `api.queue-booking/README.md` → Schema section

3) Blockers (or "None")
   - None

4) Tomorrow
   - JS Runtime I — Event Loop & Microtasks (Day 2)

5) Questions for EM (optional, or "None")
