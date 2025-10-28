const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const directValue = import.meta.env.VITE_API_BASE_URL?.trim();
  if (directValue) {
    return trimTrailingSlash(directValue);
  }

  const authValue = import.meta.env.VITE_AUTH_API_BASE_URL?.trim();
  if (authValue) {
    const normalized = trimTrailingSlash(authValue);
    return normalized.endsWith("/auth") ? normalized.slice(0, -5) : normalized;
  }

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000/api";
    }
    return `${protocol}//${hostname}/api`;
  }

  return "https://legalvn.online/api";
};

const resolveAuthApiBaseUrl = (apiBaseUrl: string) => {
  const envValue = import.meta.env.VITE_AUTH_API_BASE_URL?.trim();
  if (envValue) {
    return trimTrailingSlash(envValue);
  }

  return `${trimTrailingSlash(apiBaseUrl)}/auth`;
};

const apiBaseUrl = resolveApiBaseUrl();
const authApiBaseUrl = resolveAuthApiBaseUrl(apiBaseUrl);

// Environment variables
export const config = {
  googleClientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "368357986869-0h8o0pnq76to4si6mq45emcdecn9p2gh.apps.googleusercontent.com",
  apiBaseUrl,
  authApiBaseUrl,
  bountiesApiBaseUrl: `${trimTrailingSlash(apiBaseUrl)}/bounties`,
  adminAccessPassword: import.meta.env.VITE_ADMIN_PASSWORD?.trim() ?? "",
};
