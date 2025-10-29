export type Bounty = {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
  rewardToken: string;
  deadline: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type BountyResponse = {
  ok: boolean;
  bounties: Bounty[];
};
