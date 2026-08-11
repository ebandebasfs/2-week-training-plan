import { useQuery } from "@tanstack/react-query";
import { fetchSlots } from "@/lib/api/slots";

export function useSlots() {
  return useQuery({
    queryKey: ["slots", "available"],
    queryFn: () => fetchSlots({ available: true }),
  });
}
