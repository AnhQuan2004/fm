export type UserProfile = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  location: string;
  skills: string[];
  socials: string;
  github: string;
  displayName: string;
  bio: string;
  updatedAt?: string;
  role?: "user" | "partner" | "admin";
};
