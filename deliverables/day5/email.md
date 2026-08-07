Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 5 (Fri W1) — Joins Lab + Subquery/JOIN Comparison + Week-1 Summary + Video Rep

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 5 (Fri W1)
track: SQL
deliverable_expected: PR #5 — joins lab + subquery/JOIN comparison + week-1 summary MD · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/5
extra_links: https://www.loom.com/share/86bcfb4825084357849831ecf46b6b23
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Diffed INNER/LEFT/RIGHT JOIN row counts (8/13/8) on the same customers-bookings query and explained each result, including why RIGHT came out identical to INNER (bookings.customer_id is a required FK, so there's no orphaned row for RIGHT to expose).
   - Rewrote an EXISTS subquery ("customers who booked in the last 7 days") as an INNER JOIN + DISTINCT, verified both return the same 5 customers against the live seeded DB, and documented why DISTINCT was needed (it dedupes whole output rows, not a column).
   - Wrote the Week-1 summary: one sentence per day (Mon-Fri) plus a paragraph on what SQL fundamentals clicked.

2) Evidence / how to verify
   - Lab file: `exercises/day5-joins-lab.sql` (INNER/LEFT/RIGHT diff + subquery-vs-JOIN comparison, queries + real output + verification table)
   - Week-1 summary: `deliverables/day5/week1-summary.md`
   - Video rep / recording: https://www.loom.com/share/86bcfb4825084357849831ecf46b6b23
   - PR #5: https://github.com/ebandebasfs/2-week-training-plan/pull/5

3) Blockers (or "None")
   - None

4) Tomorrow
   - SQL III — Safe Migrations & Indexing (Day 6)

5) Questions for EM (optional, or "None")
   -
