export interface AppUser {
  username: string;
  role: 'USER' | 'ADMIN';
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'hi';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export interface AppState {
  theme: Theme;
  language: Language;
  user: AppUser | null;
  todos: Todo[];
  isLoadingTodos: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  login: (username: string, role: 'USER' | 'ADMIN') => void;
  logout: () => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  fetchTodos: () => Promise<void>;
}
