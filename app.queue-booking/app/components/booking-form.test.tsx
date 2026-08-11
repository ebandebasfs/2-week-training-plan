import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookingForm from "./booking-form";
import { fixtureSlots, fixtureSlotsAfterBooking } from "@/test/fixtures/slots";

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// Proves invalidation (a real refetch), not just that the mutation ran — see
// primer-tanstack-query-concepts.md's "Mistake 1" for why that distinction matters.
describe("BookingForm — TanStack Query mutation invalidation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refetches the slots list after a successful booking mutation", async () => {
    let getSlotsCallCount = 0;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.includes("/slots")) {
        getSlotsCallCount += 1;
        // 1st call: mount. 2nd call: post-invalidation refetch.
        const body = getSlotsCallCount === 1 ? fixtureSlots : fixtureSlotsAfterBooking;
        return new Response(JSON.stringify(body), { status: 200 });
      }

      if (url.includes("/bookings") && init?.method === "POST") {
        return new Response(
          JSON.stringify({ id: "booking-1", slot: fixtureSlots[0], status: "pending", notes: null }),
          { status: 201 },
        );
      }

      throw new Error(`Unhandled fetch in test: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderWithClient(<BookingForm />);

    await waitFor(() => expect(screen.getByRole("option", { name: /09:00/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText("Slot"), fixtureSlots[0].id);
    await user.click(screen.getByRole("button", { name: /book slot/i }));

    await waitFor(() => expect(screen.getByText(/just refetched and invalidated/i)).toBeInTheDocument());

    // Booked slot is gone via a real refetch, not a manual cache edit.
    await waitFor(() => expect(screen.queryByRole("option", { name: /09:00/ })).not.toBeInTheDocument());
    expect(screen.getByRole("option", { name: /09:30/ })).toBeInTheDocument();

    const postCalls = fetchMock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "POST");
    expect(postCalls).toHaveLength(1);
    expect(JSON.parse((postCalls[0][1] as RequestInit).body as string)).toMatchObject({
      slotId: fixtureSlots[0].id,
    });

    const getSlotsCalls = fetchMock.mock.calls.filter(([input]) => input.toString().includes("/slots"));
    expect(getSlotsCalls).toHaveLength(2); // mount + post-invalidation refetch
  });
});
