Subject: [TP-DELIVERABLE] Ethan Patrick Bandebas · Day 4 (Thu W1) — SQL Lab + Broken-Report Exercise + Video Rep

---AGENT-METADATA---
employee: Ethan Patrick Bandebas
plan: ethanpatrickbandebas-training-plan.html
day: Day 4 (Thu W1)
track: SQL
deliverable_expected: PR #4 — SQL lab file with outputs + explanations · exercise result to EM · video rep
deliverable_type: PR
deliverable_link: https://github.com/ebandebasfs/2-week-training-plan/pull/4
extra_links: https://www.loom.com/share/ae8b3322e980479297ce5aff10c3a057
status: Done
---END-METADATA---

1) What I did (3-5 bullets, past tense, specific — one sentence first)
   - Worked the three SQL labs (customers with 2+ bookings via `GROUP BY`/`HAVING`, bookings split by NULL vs non-NULL notes, and the stretch daily-booking-count query) against the live seeded `queue_booking` DB.
   - Diagnosed the EM-led broken-report exercise: the original query's `WHERE b.status = 'confirmed'` ran after the `LEFT JOIN`, silently dropping customers with zero confirmed bookings; fixed by moving the status filter into the `JOIN ... AND` clause.
   - Answered the one-sentence explanations on NULL handling and `COUNT(*)` vs `COUNT(column)` on a null-extended row, inline in `exercises/day4-broken-report.sql`.
   - Recorded a single English video rep covering exercise walkthrough and a line-by-line query explanation.

2) Evidence / how to verify
   - Lab file: `exercises/day4-sql-lab.sql` (all three labs, queries + real output + takeaways)
   - Broken-report exercise: `exercises/day4-broken-report.sql` (diagnosis, fixed query, fixed output, one-sentence answers)
   - Video rep / recording: https://www.loom.com/share/ae8b3322e980479297ce5aff10c3a057
   - PR #4: https://github.com/ebandebasfs/2-week-training-plan/pull/4

3) Blockers (or "None")
   - None — PR #3 (Day 3) is still open/unmerged, so PR #4 is stacked on top of it rather than `master`; diff will show Day 1–3's commits until those merge, and will narrow automatically once they do.

4) Tomorrow
   - SQL II — Joins & Subqueries (Day 5)

5) Questions for EM (optional, or "None")
   - None
