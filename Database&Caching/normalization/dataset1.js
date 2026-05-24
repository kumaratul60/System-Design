// dataset1.js: Relational blog feed showing raw nested vs. expected normalized structures
// This file is purely declarative and contains no logic or functions.

// 1. Raw Deeply Nested API Payload (Before Normalization)
const nested = [
  {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: '/avatars/alice.png',
    posts: [
      {
        id: 101,
        title: 'Scaling Client Cache',
        body: 'Detailed guide on client-side state normalization...',
        publishedAt: '2026-05-24T10:00:00Z',
        comments: [
          {
            id: 201,
            body: 'Great explanation of O(1) lookups!',
            createdAt: '2026-05-24T10:30:00Z',
            author: {
              id: 2,
              name: 'Bob Jones',
              email: 'bob@example.com',
            },
          },
          {
            id: 202,
            body: 'How do you handle garbage collection?',
            createdAt: '2026-05-24T11:00:00Z',
            author: {
              id: 3,
              name: 'Charlie Brown',
              email: 'charlie@example.com',
            },
          },
        ],
      },
      {
        id: 102,
        title: 'CSS layout containment basics',
        body: 'Understanding the containment property...',
        publishedAt: '2026-05-24T12:00:00Z',
        comments: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Bob Jones',
    email: 'bob@example.com',
    avatar: '/avatars/bob.png',
    posts: [
      {
        id: 103,
        title: 'Tab Duplication Scopes in SessionStorage',
        body: 'Deep dive on SOP boundaries and duplication handlers...',
        publishedAt: '2026-05-24T13:00:00Z',
        comments: [
          {
            id: 203,
            body: 'Wow, did not know about copy-on-write decoupling!',
            createdAt: '2026-05-24T13:15:00Z',
            author: {
              id: 1,
              name: 'Alice Smith',
              email: 'alice@example.com',
            },
          },
        ],
      },
    ],
  },
];

// 2. Fully Normalized State Graph (After Normalization)
const normalized = {
  users: {
    byIds: {
      1: {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        avatar: '/avatars/alice.png',
        posts: [101, 102],
      },
      2: {
        id: 2,
        name: 'Bob Jones',
        email: 'bob@example.com',
        avatar: '/avatars/bob.png',
        posts: [103],
      },
      3: {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
      },
    },
    allIds: [1, 2, 3],
  },
  posts: {
    byIds: {
      101: {
        id: 101,
        title: 'Scaling Client Cache',
        body: 'Detailed guide on client-side state normalization...',
        publishedAt: '2026-05-24T10:00:00Z',
        comments: [201, 202],
      },
      102: {
        id: 102,
        title: 'CSS layout containment basics',
        body: 'Understanding the containment property...',
        publishedAt: '2026-05-24T12:00:00Z',
        comments: [],
      },
      103: {
        id: 103,
        title: 'Tab Duplication Scopes in SessionStorage',
        body: 'Deep dive on SOP boundaries and duplication handlers...',
        publishedAt: '2026-05-24T13:00:00Z',
        comments: [203],
      },
    },
    allIds: [101, 102, 103],
  },
  comments: {
    byIds: {
      201: {
        id: 201,
        body: 'Great explanation of O(1) lookups!',
        createdAt: '2026-05-24T10:30:00Z',
        author: 2,
      },
      202: {
        id: 202,
        body: 'How do you handle garbage collection?',
        createdAt: '2026-05-24T11:00:00Z',
        author: 3,
      },
      203: {
        id: 203,
        body: 'Wow, did not know about copy-on-write decoupling!',
        createdAt: '2026-05-24T13:15:00Z',
        author: 1,
      },
    },
    allIds: [201, 202, 203],
  },
};

module.exports = {
  nested,
  normalized,
};
