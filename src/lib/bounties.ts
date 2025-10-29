import { config } from "@/config/env";
import type { Bounty, BountyResponse } from "@/types/bounty";

export const fetchBounties = async (signal?: AbortSignal): Promise<Bounty[]> => {
  const response = await fetch(config.bountiesApiBaseUrl, { signal });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Failed to fetch bounties");
  }

  const payload = (await response.json()) as BountyResponse;

  if (!payload.ok) {
    throw new Error("Bounty API responded with an error");
  }

  return Array.isArray(payload.bounties) ? payload.bounties : [];
};
