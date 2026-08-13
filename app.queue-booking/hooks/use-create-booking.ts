import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "@/lib/api/bookings";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // The slot booked is no longer available — invalidate the cached slots.
      // Matches ["slots", "available"] in use-slots.ts by prefix.
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
