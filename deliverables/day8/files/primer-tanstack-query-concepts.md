# TanStack Query Concepts Primer

**Read this before Day 8 coding. Time: ~30 minutes.**

---

## The Core Problem TanStack Query Solves

When your React component fetches data from an API, you're managing two states:
1. **Server state** — what's actually on the server right now
2. **Client state** — what you're displaying in the UI

Without a tool, these drift apart. You fetch `/api/slots`, the user creates a booking, but your component still shows the old slot list. TanStack Query bridges this gap.

---

## The Three Key Concepts

### 1. Stale-Cache

**What it means:** TanStack Query keeps a copy of your API response in memory (the cache). This cache has a "freshness" status — it starts "fresh," and after a timeout, becomes "stale."

- **Fresh cache:** Your component uses the cached copy without re-fetching.
- **Stale cache:** Your component still shows the cached copy BUT will re-fetch in the background if the user returns to the page or a dependency changes.
- **No cache:** If the cache expires, the next component that needs this data waits for a fresh fetch.

**Why it matters:** Users see instant UI updates from the cache, while background fetches keep data current.

**Example:** You fetch `/api/slots` at 10:00am. At 10:01am, the user switches tabs and back — TanStack Query sees the cache is stale and re-fetches. The user sees the cached slots instantly, then they update in the background.

### 2. Invalidation

**What it means:** When something changes on the server (e.g., the user creates a booking), you tell TanStack Query to throw away the cache for that data and re-fetch.

Without invalidation: User creates a booking → app says "success" → but the slots list still shows the old data (because the cache is still "fresh").

With invalidation: User creates a booking → `queryClient.invalidateQueries({ queryKey: ['slots'] })` → TanStack Query marks the slots cache as stale → component re-fetches `/api/slots` → user sees the updated list.

**Syntax you'll use:**
```javascript
const createBooking = useMutation({
  mutationFn: (booking) => api.createBooking(booking),
  onSuccess: () => {
    // Invalidate the slots query so it re-fetches
    queryClient.invalidateQueries({ queryKey: ['slots'] })
  }
})
```

**Why it matters:** Mutations (POST, PUT, DELETE) must tell queries to refresh, or the UI gets stale.

### 3. Query Keys

**What it means:** A query key is a unique ID for a cached query. TanStack Query uses it to track which cache to use and which to invalidate.

**Examples:**
- `['slots']` — the query that fetches all slots
- `['slots', 'available']` — slots filtered to available only (different cache)
- `['customer', userId]` — the query for a specific customer (one cache per userId)

**Why it matters:** If you create a booking for customer #5 and invalidate `['customer', 5]`, only customer #5's data re-fetches. Customer #6's cache stays fresh. Precision saves bandwidth.

---

## The Query + Mutation Lifecycle

### useQuery — Fetching Data

```javascript
const { data: slots, isLoading, error } = useQuery({
  queryKey: ['slots'],
  queryFn: async () => {
    const res = await fetch('/api/slots');
    return res.json();
  },
  staleTime: 1000 * 60 * 5, // cache is fresh for 5 minutes
})
```

**What happens:**
1. Component mounts → `isLoading = true`, fetches `/api/slots`
2. Data arrives → `slots = [...]`, `isLoading = false`
3. Cache becomes "fresh" for 5 minutes
4. After 5 minutes → cache becomes "stale" (but still shows old data)
5. If user navigates away and back → sees stale data, re-fetches in background

### useMutation — Creating/Updating Data

```javascript
const { mutate: createBooking } = useMutation({
  mutationFn: async (booking) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking)
    });
    return res.json();
  },
  onSuccess: () => {
    // After mutation succeeds, invalidate queries that depend on it
    queryClient.invalidateQueries({ queryKey: ['slots'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }
});

// When user clicks "Book":
createBooking({ slotId: 123, customerId: 456 });
```

**What happens:**
1. User clicks "Book" → `mutate()` fires
2. API call `/api/bookings` (POST) → waits for response
3. Success → `onSuccess` fires
4. Invalidate `['slots']` and `['bookings']` → those caches are marked stale
5. Any component using those queries automatically re-fetches
6. UI shows fresh data

---

## Common Mistakes (Avoid These)

### ❌ Mistake 1: Manual Cache Updates Instead of Invalidation

```javascript
// WRONG:
const { data: slots } = useQuery(...);
createBooking.mutate(booking, {
  onSuccess: () => {
    // Trying to manually update the cache
    slots.push(newBooking); // This breaks reactivity
  }
});
```

**Why it breaks:** You're mutating the cached object directly, React doesn't know about the change, UI doesn't update.

**Right way:**
```javascript
// RIGHT:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['slots'] });
}
// TanStack Query handles the re-fetch, React sees the new data
```

### ❌ Mistake 2: Forgetting to Invalidate Related Queries

```javascript
// When user creates a booking:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['slots'] }); // ✓
  // But forgot to invalidate customer's booking history!
  // queryClient.invalidateQueries({ queryKey: ['bookings'] }); // ✗ Missing
}
```

**Result:** Slots list updates, but the customer's "My Bookings" page is stale.

### ❌ Mistake 3: Not Setting `staleTime`

```javascript
// If you don't set staleTime, default is 0
useQuery({
  queryKey: ['slots'],
  queryFn: fetchSlots,
  // staleTime: 0 (default) — cache is always stale
})
// Component mounts → fetches
// User navigates away and back → fetches again (even 1 second later)
// This kills performance
```

**Right way:** Set a reasonable staleTime for your use case:
```javascript
staleTime: 1000 * 60 * 5, // 5 minutes — slots don't change that often
```

---

## What You'll Build on Day 8

1. **useQuery for slots:** Fetch the list of available slots
2. **useMutation for bookings:** Create a booking and invalidate slots + bookings lists
3. **Proof:** Create a booking → slots list re-fetches automatically → user sees updated availability

---

## Resources

- **TanStack Query Official Docs:** https://tanstack.com/query/latest/docs/framework/react/overview
- **React 18 Fundamentals on Pluralsight:** https://www.pluralsight.com/courses/react-18-fundamentals (for context on rendering)
- **Stale-While-Revalidate Pattern:** https://www.rfc-editor.org/rfc/rfc5861 (the idea TanStack Query implements)

---

**Next:** Day 8 hands-on. Build it, watch the DevTools, and verify the invalidation works.
