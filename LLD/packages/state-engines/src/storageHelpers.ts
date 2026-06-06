import type { Theme, Language, AppUser } from "./types";

export const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem("lld_theme");
  console.log("[storageHelpers] Loading theme from localStorage. Raw value:", saved);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed === "dark" || parsed === "light") {
        console.log("[storageHelpers] Parsed JSON theme successfully:", parsed);
        return parsed as Theme;
      }
    } catch {
      // Fallback to raw string comparison if JSON parsing fails
      if (saved === "dark" || saved === "light") {
        console.log("[storageHelpers] Read raw string theme successfully:", saved);
        return saved as Theme;
      }
    }
  }
  console.log("[storageHelpers] Falling back to default theme: light");
  return "light";
};

export const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem("lld_language");
  console.log("[storageHelpers] Loading language from localStorage. Raw value:", saved);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed === "en" || parsed === "es" || parsed === "hi") {
        console.log("[storageHelpers] Parsed JSON language successfully:", parsed);
        return parsed as Language;
      }
    } catch {
      // Fallback to raw string comparison if JSON parsing fails
      if (saved === "en" || saved === "es" || saved === "hi") {
        console.log("[storageHelpers] Read raw string language successfully:", saved);
        return saved as Language;
      }
    }
  }
  console.log("[storageHelpers] Falling back to default language: en");
  return "en";
};

export const getInitialUser = (): AppUser | null => {
  const saved = localStorage.getItem("lld_user");
  console.log("[storageHelpers] Loading user from localStorage. Raw value:", saved);
  if (saved === "null") {
    console.log("[storageHelpers] Explicitly logged out session found.");
    return null;
  }
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as AppUser;
      if (parsed && typeof parsed === "object" && parsed.username) {
        console.log("[storageHelpers] Parsed user session successfully:", parsed);
        return parsed;
      }
    } catch {
      // Fallback
    }
  }
  
  // Default user session: Logged in as ADMIN developer so user does not see login guard screen by default.
  const defaultUser: AppUser = { username: "Developer", role: "ADMIN" };
  console.log("[storageHelpers] No active user found. Logging in default admin user:", defaultUser);
  localStorage.setItem("lld_user", JSON.stringify(defaultUser));
  return defaultUser;
};

export const setStorageTheme = (theme: Theme) => {
  console.log("[storageHelpers] Writing theme to localStorage:", theme);
  localStorage.setItem("lld_theme", JSON.stringify(theme));
};

export const setStorageLanguage = (lang: Language) => {
  console.log("[storageHelpers] Writing language to localStorage:", lang);
  localStorage.setItem("lld_language", JSON.stringify(lang));
};

export const setStorageUser = (user: AppUser | null) => {
  console.log("[storageHelpers] Writing user to localStorage:", user);
  localStorage.setItem("lld_user", JSON.stringify(user));
};
