export type Bounty = {
  id: string;
  title: string;
  description: string;
  category: "dev" | "content" | "design" | "research";
  rewardAmount: number;
  rewardToken: string;
  deadline: string;
  status: "open" | "in_review" | "closed" | "in-progress";
  createdBy: string;
  creatorEmail: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
};
