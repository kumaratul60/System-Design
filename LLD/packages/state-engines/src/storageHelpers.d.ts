import type { Theme, AppUser } from "./types";
export declare const getInitialTheme: () => Theme;
export declare const getInitialUser: () => AppUser | null;
export declare const setStorageTheme: (theme: Theme) => void;
export declare const setStorageUser: (user: AppUser | null) => void;
