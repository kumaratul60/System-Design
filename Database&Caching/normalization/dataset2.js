// dataset2.js: Kanban Board showing raw nested vs. expected normalized structures
// This file is purely declarative and contains no logic or functions.

// 1. Raw Deeply Nested API Payload (Before Normalization)
const nested = [
  {
    id: 'proj_1',
    name: 'System Design Revamp',
    workspaceId: 'ws_99',
    columns: [
      {
        id: 'col_todo',
        title: 'To Do',
        tasks: [
          {
            id: 'task_101',
            title: 'Implement SafeCookie class',
            description: 'Build a static helper wrapper for prefixed cookies',
            priority: 'high',
            tags: [
              { id: 'tag_sec', name: 'Security', color: 'red' },
              { id: 'tag_fe', name: 'Frontend', color: 'blue' },
            ],
            assignees: [{ id: 'usr_charlie', name: 'Charlie Brown', role: 'Developer' }],
            comments: [
              {
                id: 'c_401',
                text: 'Remember to enforce double-quotes on Clear-Site-Data',
                author: { id: 'usr_alice', name: 'Alice Smith', role: 'Architect' },
              },
            ],
          },
        ],
      },
      {
        id: 'col_in_progress',
        title: 'In Progress',
        tasks: [
          {
            id: 'task_102',
            title: 'Optimize layout thrashing issues',
            description: 'Replace style recalcs with requestAnimationFrame loops',
            priority: 'critical',
            tags: [
              { id: 'tag_perf', name: 'Performance', color: 'green' },
              { id: 'tag_fe', name: 'Frontend', color: 'blue' },
            ],
            assignees: [
              { id: 'usr_bob', name: 'Bob Jones', role: 'Developer' },
              { id: 'usr_alice', name: 'Alice Smith', role: 'Architect' },
            ],
            comments: [],
          },
        ],
      },
    ],
  },
];

// 2. Fully Normalized State Graph (After Normalization)
const normalized = {
  projects: {
    byIds: {
      proj_1: {
        id: 'proj_1',
        name: 'System Design Revamp',
        workspaceId: 'ws_99',
        columns: ['col_todo', 'col_in_progress'],
      },
    },
    allIds: ['proj_1'],
  },
  columns: {
    byIds: {
      col_todo: {
        id: 'col_todo',
        title: 'To Do',
        tasks: ['task_101'],
      },
      col_in_progress: {
        id: 'col_in_progress',
        title: 'In Progress',
        tasks: ['task_102'],
      },
    },
    allIds: ['col_todo', 'col_in_progress'],
  },
  tasks: {
    byIds: {
      task_101: {
        id: 'task_101',
        title: 'Implement SafeCookie class',
        description: 'Build a static helper wrapper for prefixed cookies',
        priority: 'high',
        tags: ['tag_sec', 'tag_fe'],
        assignees: ['usr_charlie'],
        comments: ['c_401'],
      },
      task_102: {
        id: 'task_102',
        title: 'Optimize layout thrashing issues',
        description: 'Replace style recalcs with requestAnimationFrame loops',
        priority: 'critical',
        tags: ['tag_perf', 'tag_fe'],
        assignees: ['usr_bob', 'usr_alice'],
        comments: [],
      },
    },
    allIds: ['task_101', 'task_102'],
  },
  tags: {
    byIds: {
      tag_sec: { id: 'tag_sec', name: 'Security', color: 'red' },
      tag_fe: { id: 'tag_fe', name: 'Frontend', color: 'blue' },
      tag_perf: { id: 'tag_perf', name: 'Performance', color: 'green' },
    },
    allIds: ['tag_sec', 'tag_fe', 'tag_perf'],
  },
  users: {
    byIds: {
      usr_charlie: { id: 'usr_charlie', name: 'Charlie Brown', role: 'Developer' },
      usr_alice: { id: 'usr_alice', name: 'Alice Smith', role: 'Architect' },
      usr_bob: { id: 'usr_bob', name: 'Bob Jones', role: 'Developer' },
    },
    allIds: ['usr_charlie', 'usr_alice', 'usr_bob'],
  },
  comments: {
    byIds: {
      c_401: {
        id: 'c_401',
        text: 'Remember to enforce double-quotes on Clear-Site-Data',
        author: 'usr_alice',
      },
    },
    allIds: ['c_401'],
  },
};

module.exports = {
  nested,
  normalized,
};
