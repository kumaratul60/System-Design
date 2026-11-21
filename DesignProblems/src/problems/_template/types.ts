export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
}

export interface TemplateState {
  items: TemplateItem[];
  status: LoadingStatus;
  error: string | null;
}
