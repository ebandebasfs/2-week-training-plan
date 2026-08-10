# App Router walkthrough — `app.queue-booking`

Per the plan (Day 7, Next.js beat): which components are server vs client, how
the page fetches its data, and why the booking form has to be a client
component.

## File tree, annotated

```
app/
├── layout.tsx                   Server Component (default, no directive)
├── page.tsx                     Server Component, renders <BookingForm />
├── hydration-drill/
│   └── page.tsx                 Server Component, renders <QueueTicket />
└── components/
    ├── booking-form.tsx         "use client", controlled inputs, render counter
    ├── slot-summary.tsx         "use client", React.memo child of BookingForm
    └── queue-ticket.tsx         "use client", hydration drill component

data/
└── mock-slots.ts                Plain TS module, no directive, safe to
                                  import from either server or client code
```

**The rule that decides server vs client here:** a component is a Client
Component if it needs `useState`, `useEffect`, or event handlers like
`onChange`/`onSubmit`: basically, anything that has to run in the browser to
be interactive. Otherwise it defaults to Server Component. `layout.tsx` and
both `page.tsx` files have no interactivity of their own, so they stay
Server Components; they just compose Client Components in.

## The server ↔ client correlation

Both routes are the same shape: a Server Component that renders a Client
Component.

- `page.tsx` (Server) → `<BookingForm />` (Client)
- `hydration-drill/page.tsx` (Server) → `<QueueTicket />` (Client)

That direction only works one way. A Server Component can `import` and
render a Client Component directly, because the Server Component's own job
is done once it's rendered, the Client Component takes over from there and
ships to the browser to become interactive. The reverse doesn't work: a
Client Component can't `import` a Server Component and render it the same
way, since a Server Component needs server-only execution (no hooks, no
browser APIs) that the client bundle can't provide. A Client Component can
only *receive* a Server Component as an already-rendered `children`/prop
from an ancestor further up the tree.

This is the same boundary the hydration drill sits on: `hydration-drill/page.tsx`
renders once, server-side, and never runs again. `QueueTicket` renders
*twice*: once during the server's SSR pass, producing the initial HTML, and
once again in the browser during hydration. That's exactly why it's the one
capable of a hydration mismatch, while `hydration-drill/page.tsx` isn't.

## Why `BookingForm` must be a client component

**One sentence:** `BookingForm` holds controlled-input state (`slotId`,
`notes` via `useState`) and a render counter (`useRef` + `useEffect`), and
Server Components can't run hooks or respond to browser events at all so
anything with `onChange`/`onSubmit` and local state has no choice but to be
a Client Component.

## How the page fetches its data (today)

It doesn't, no real backend fetch yet. `booking-form.tsx` does a static import
of `availableMockSlots` from `data/mock-slots.ts`, which is just an in-memory
array baked into the bundle. There's no network request, no loading state,
no API call.
