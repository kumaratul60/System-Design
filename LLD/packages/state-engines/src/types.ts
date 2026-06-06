export interface AppUser {
  username: string;
  role: 'USER' | 'ADMIN';
}

export type Theme = 'light' | 'dark';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export interface AppState {
  theme: Theme;
  user: AppUser | null;
  todos: Todo[];
  isLoadingTodos: boolean;
  setTheme: (theme: Theme) => void;
  login: (username: string, role: 'USER' | 'ADMIN') => void;
  logout: () => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  fetchTodos: () => Promise<void>;
}
