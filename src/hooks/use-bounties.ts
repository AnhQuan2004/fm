import { useQuery } from "@tanstack/react-query";
import { fetchBounties } from "@/lib/bounties";

export const useBounties = () =>
  useQuery({
    queryKey: ["bounties"],
    queryFn: ({ signal }) => fetchBounties(signal),
    staleTime: 1000 * 60,
  });
