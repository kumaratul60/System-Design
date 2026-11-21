import React from 'react';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface ProblemDefinition {
  id: string;
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  description: string;
  tags: string[];
  component: React.ComponentType;
}
