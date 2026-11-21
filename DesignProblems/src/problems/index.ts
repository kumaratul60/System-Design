import { ProblemDefinition } from '../types/problem';
import { InfiniteScrollProblem } from './infinite-scroll';

export const PROBLEMS_REGISTRY: ProblemDefinition[] = [
  {
    id: 'infinite-scroll',
    title: 'Infinite Scroll & Virtualization',
    category: 'Data Display & Feeds',
    difficulty: 'Medium',
    description:
      'Production-grade infinite scrolling comparing IntersectionObserver sentinel observation vs. window scroll calculations with overfetch guards and deduplication.',
    tags: ['IntersectionObserver', 'Scroll Listener', 'Pagination', 'Concurrency Guard'],
    component: InfiniteScrollProblem,
  },
  // To add a new problem:
  // 1. Copy `src/problems/_template` to `src/problems/<your-problem-name>`
  // 2. Export your component and add it here!
];
