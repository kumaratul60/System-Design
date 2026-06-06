import type { Theme, Language, AppUser } from "./types";
export declare const getInitialTheme: () => Theme;
export declare const getInitialLanguage: () => Language;
export declare const getInitialUser: () => AppUser | null;
export declare const setStorageTheme: (theme: Theme) => void;
export declare const setStorageLanguage: (lang: Language) => void;
export declare const setStorageUser: (user: AppUser | null) => void;
