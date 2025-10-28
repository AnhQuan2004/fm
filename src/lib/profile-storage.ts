import type { UserProfile } from "@/types/profile";

const PROFILE_SESSION_KEY = "userProfile";

export const loadSessionProfile = (): UserProfile | null => {
  const raw = sessionStorage.getItem(PROFILE_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as UserProfile;
    const resolvedRole =
      data.role === "admin" || data.role === "partner" || data.role === "user"
        ? data.role
        : undefined;
    return {
      email: data.email || "",
      username: data.username || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      location: data.location || "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      socials: data.socials || "",
      github: data.github || "",
      displayName: data.displayName || "",
      bio: data.bio || "",
      updatedAt: data.updatedAt,
      role: resolvedRole,
    };
  } catch (error) {
    console.error("Failed to parse stored profile", error);
    return null;
  }
};

export const storeSessionProfile = (profile: UserProfile) => {
  sessionStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(profile));
  sessionStorage.setItem("userDisplayName", profile.displayName || "");
  sessionStorage.setItem("userBio", profile.bio || "");
  if (profile.role) {
    sessionStorage.setItem("userRole", profile.role);
  } else {
    sessionStorage.removeItem("userRole");
  }
};

export const clearSessionProfile = () => {
  sessionStorage.removeItem(PROFILE_SESSION_KEY);
  sessionStorage.removeItem("userDisplayName");
  sessionStorage.removeItem("userBio");
  sessionStorage.removeItem("userRole");
};
