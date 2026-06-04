import type { Todo } from "./types";

export const fetchDummyTodos = async (): Promise<Todo[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
  if (!response.ok) {
    throw new Error("Failed to fetch todos from dummy API");
  }
  const data: Todo[] = await response.json();
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    completed: item.completed
  }));
};
