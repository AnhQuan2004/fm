const ADMIN_OVERRIDE_STORAGE_KEY = "adminAccessOverride";

export const getAdminOverride = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(ADMIN_OVERRIDE_STORAGE_KEY) === "true";
};

export const setAdminOverride = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  if (value) {
    window.localStorage.setItem(ADMIN_OVERRIDE_STORAGE_KEY, "true");
  } else {
    window.localStorage.removeItem(ADMIN_OVERRIDE_STORAGE_KEY);
  }
};
