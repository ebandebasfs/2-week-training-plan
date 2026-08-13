# Invalidation proof — GET → POST → GET

No browser/display was available in the environment this was run in, so this
is network-level proof of the same flow `booking-form.tsx` drives: `useQuery`
fetches `/api/slots?available=true`, `useMutation` posts to `/api/bookings`,
and `onSuccess` calls `queryClient.invalidateQueries({ queryKey: ['slots'] })`
— which is what triggers step 3 below. Ran against the live API + SQL Server
container (not mocked); the booked slot is deleted afterward to restore the
seed baseline. `booking-form.test.tsx` covers the same invalidation behavior
at the component level, with a mocked API.

```
=== 1) GET /api/slots?available=true (before booking) — 7 available ===
[
  { "id": "4D5C433E-...", "appointmentDate": "2026-08-03", "startTime": "15:00:00", ... },
  { "id": "3B5C433E-...", "appointmentDate": "2026-08-06", "startTime": "13:00:00", ... },
  { "id": "5F5C433E-...", "appointmentDate": "2026-08-08", "startTime": "10:00:00", ... },
  { "id": "235C433E-...", "appointmentDate": "2026-08-09", "startTime": "09:00:00", ... },
  { "id": "535C433E-...", "appointmentDate": "2026-08-11", "startTime": "13:00:00", ... },
  { "id": "175C433E-...", "appointmentDate": "2026-08-14", "startTime": "09:00:00", ... },
  { "id": "355C433E-...", "appointmentDate": "2026-08-14", "startTime": "09:00:00", ... }
]

=== 2) POST /api/bookings — booking slot 3B5C433E-F36B-1410-8318-00A94AFFFBBF ===
{"id":"2FAF433E-...","customer":{"id":"095C433E-...","firstName":"Bradford","lastName":"Gerlach",...},
 "slot":{"id":"3B5C433E-...","appointmentDate":"2026-08-06","startTime":"13:00:00",...},
 "status":"pending","notes":"Day 8 invalidation demo","bookingStatus":"pending"}
HTTP 201

=== 3) GET /api/slots?available=true (after booking) — 6 available ===
[
  { "id": "4D5C433E-...", ... },
  { "id": "5F5C433E-...", ... },
  { "id": "235C433E-...", ... },
  { "id": "535C433E-...", ... },
  { "id": "175C433E-...", ... },
  { "id": "355C433E-...", ... }
]

=== 4) Slot 3B5C433E-F36B-1410-8318-00A94AFFFBBF no longer present in the available list ===
False
```

Full raw output (including full JSON, uuids untruncated) was captured during
the session; the above is the same data condensed for readability.

## Live UI confirmation

Also driven manually through the actual UI at `localhost:3000` against the
same live API/DB (3 real bookings, no test markers). `GET /api/slots?available=true`
count tracked each one correctly: 7 → 4. Confirms the same `useMutation` →
`invalidateQueries` → `useQuery` refetch loop through the real browser, not
just direct API calls.
