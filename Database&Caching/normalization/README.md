# Client-Side State Normalization

State normalization is the architectural practice of structuring client-side application state or database caches by flattening nested records into relational, key-value lookup tables.

- **Key Takeaway**: Storing data in a nested tree structure (the default format returned by most JSON REST APIs) is an anti-pattern for dynamic applications. It causes redundant records, state sync bugs, and slow traversal lookups ($O(N)$). Normalizing the state transforms reads and writes into efficient, constant-time ($O(1)$) operations.

---

## 1. What is Normalization?

Normalization involves reorganizing complex data into three primary structures:

1. **Flattening the data structure**: Removing arrays of nested objects and converting them into flat objects keyed by unique IDs.
2. **Storing entities separately**: Giving each type of entity (e.g., users, posts, comments) its own dedicated collection.
3. **Relationships via unique IDs**: Connecting entities together using ID references rather than nesting objects inside one another.

### A. The Student-College Schema Example

#### ❌ The Denormalized (Nested) Structure:

```javascript
const student = {
  id: 1,
  name: 'Atul',
  city: 'bangalore',
  college: {
    id: 'cg1',
    name: 'IIT Delhi',
    pincode: 110003,
  },
};
```

_If 500 students attend `IIT Delhi`, the entire `college` object is duplicated 500 times in memory. If the college pincode changes, we must search and update all 500 records._

#### The Normalized (Flat) Structure:

```javascript
const student = {
  id: 1,
  name: 'Chirag',
  city: 'bangalore',
  college: 'cg1', // Relational reference using a unique ID
};

const colleges = {
  cg1: {
    id: 'cg1',
    name: 'IIT Delhi',
    pincode: 110003,
  },
};
```

_Now, the college details are stored in exactly **one** location. Updates are applied once, and all referencing students instantly access the updated state._

---

## 2. Why Normalize? (Core Benefits)

- **Remove Redundancy**: Avoid duplicating objects across multiple parent containers (e.g., a shared post appearing in multiple users' feeds).
- **Efficiency & Performance**: Drastically reduces the memory footprint of the application and speeds up state mutations.
- **Simplifies Nested Relationships**: Prevents UI inconsistencies where updating a record in one list doesn't update the same record in another list.

---

## 3. Problem Statement: Nested State & Search Complexity

Consider a standard relational payload of users and posts returned by an API:

```javascript
const state = {
  users: [
    {
      id: 1,
      name: 'Alice',
      posts: [
        { id: 101, title: 'Post 1' },
        { id: 102, title: 'Post 2' },
      ],
    },
    {
      id: 2,
      name: 'Bob',
      posts: [{ id: 103, title: 'Post 3' }],
    },
  ],
};
```

### A. Reading & Searching Complexity

To look up a post by its ID (e.g., finding the title of post `103`), we must execute a nested loop traversal over the array of users and their nested posts:

```javascript
function findPostById(state, postId) {
  for (const user of state.users) {
    for (const post of user.posts) {
      if (post.id === postId) return post;
    }
  }
  return null;
}
```

- **Search Complexity**: **$O(U \cdot P)$** (where $U$ is the number of users and $P$ is the average number of posts per user). If the client application caches a large list of feeds or messages, searching through arrays on every render or user interaction blocks the main thread.

### B. Write & Update Complexity

If a post is shared (e.g., if `Post 1` is nested under both `Alice` and another user `Charlie`'s feed), updating the post's title requires:

1. Scanning the entire data tree to find all instances.
2. Mutating each duplicate object in-place.

- **Result**: High risk of **stale state bugs**, where editing a post in one view does not update it in another view.

---

## 4. The Solution: Massaged & Normalized State

We normalize the nested state by splitting users and posts into flat objects, where keys correspond to entity IDs:

```javascript
const normalizedState = {
  users: {
    1: { id: 1, name: 'Alice', posts: [101, 102] },
    2: { id: 2, name: 'Bob', posts: [103] },
  },
  posts: {
    101: { id: 101, title: 'Post 1' },
    102: { id: 102, title: 'Post 2' },
    103: { id: 103, title: 'Post 3' },
  },
};
```

### A. Lookup Complexity Shift

- **Reading by ID**: To retrieve post `103`, we bypass search loops and access the key directly:

  ```javascript
  const post = state.posts[103];
  ```

  - **Complexity**: **$O(1)$** constant time.

- **Writing & Updating**: To edit a post's title:

  ```javascript
  state.posts[101].title = 'Updated Post Title';
  ```

  - **Complexity**: **$O(1)$** constant time. The single source of truth is modified. Any UI component rendering post `101` will automatically receive the updated title.

### B. Advanced Multi-Level & Cross-Referenced Example

Real-world applications often present multi-level nesting combined with cross-referenced tables. Consider this complex dataset containing **Users**, **Posts**, **Comments**, and **Tags** that reference the same posts:

```javascript
const state = {
  users: [
    {
      id: 1,
      name: 'Alice',
      posts: [
        {
          id: 101,
          title: 'Post 1',
          comments: [{ id: 201, text: 'Great writeup!' }],
        },
      ],
    },
    {
      id: 2,
      name: 'Bob',
      posts: [
        {
          id: 102,
          title: 'Post 2',
          comments: [{ id: 202, text: 'Interesting read' }],
        },
      ],
    },
  ],
  tags: [
    {
      id: 301,
      name: 'Tech',
      posts: [{ id: 101 }, { id: 102 }],
    },
    {
      id: 302,
      name: 'Travel',
      posts: [{ id: 102 }],
    },
  ],
};
```

#### The Problem: Lookup Waterfalls & Duplicate Graph Traversal

In this nested state, `Post 1` and `Post 2` are nested inside `users` with their full title and comments, but in `tags` they are only referenced by partial objects `{ id: 101 }`.
If you want to **find the comments of all posts tagged with "Tech"**:

1. Scan `tags` to find `Tech` (ID `301`), returning its post IDs: `[101, 102]`.
2. For each post ID, you must do a linear scan across the entire `users` array, inspect their nested `posts` arrays to find the post details, and then extract the `comments` arrays.

- **Complexity**: **$O(T \cdot U \cdot P)$** where $T$ is tags, $U$ is users, and $P$ is posts per user.
- **Stale Updates**: If you add a new comment to `Post 1` under `users[0].posts[0].comments`, components displaying posts by tags won't receive it unless you manually crawl and sync both hierarchies.

#### The Solution: Fully Normalized Multi-Entity Graph

We massage the complex nested graph into four completely flat lookup tables interlinked via ID pointers:

```javascript
const normalizedState = {
  users: {
    1: { id: 1, name: 'Alice', posts: [101] },
    2: { id: 2, name: 'Bob', posts: [102] },
  },
  posts: {
    101: { id: 101, authorId: 1, title: 'Post 1', comments: [201], tags: [301] },
    102: { id: 102, authorId: 2, title: 'Post 2', comments: [202], tags: [301, 302] },
  },
  comments: {
    201: { id: 201, postId: 101, text: 'Great writeup!' },
    202: { id: 202, postId: 102, text: 'Interesting read' },
  },
  tags: {
    301: { id: 301, name: 'Tech', posts: [101, 102] },
    302: { id: 302, name: 'Travel', posts: [102] },
  },
};
```

#### Why This is Highly Optimized

- **Constant Time Comment Retrieval by Tag**: To get the comments for "Tech" (ID `301`):
  1. Retrieve post IDs directly: `state.tags[301].posts` -> `[101, 102]` ($O(1)$).
  2. Map post IDs to comments: `state.posts[101].comments` -> `[201]` ($O(1)$).
  3. Look up comments: `state.comments[201]` ($O(1)$).
- **Single Source of Truth**: Adding a comment (ID `203`) to `Post 1` only requires:
  1. Writing to `state.comments[203] = { id: 203, postId: 101, text: 'New Comment' }` ($O(1)$).
  2. Pushing the ID to `state.posts[101].comments.push(203)` ($O(1)$).
     _This automatically updates all UI elements rendering `Post 1`, whether they are viewing it from Alice's profile feed or from the "Tech" tags feed._

---

## 5. When to Use vs. When NOT to Use

| When to Normalize (Best Practices)                                                                                               | When NOT to Normalize (Anti-Patterns)                                                                             |
| :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Relational Data Structures**: Data containing many-to-many or one-to-many relationships (e.g., users, posts, comments, likes). | **Static / Flat Lists**: Datasets without relationships (e.g., a simple list of states/countries for a dropdown). |
| **Highly Dynamic Stores**: State graphs that undergo frequent client-side updates, deletes, or additions.                        | **Read-Only / Single Views**: Data fetched once for a single detail page and discarded immediately without edits. |
| **Large Shared Caches**: Global stores accessed by multiple components simultaneously (e.g. Redux, Zustand, Pinia).              | **Local Component UI States**: Simple states like `isModalOpen: true` or `activeTabIndex: 0`.                     |

---

## 6. Staff-Level Pitfalls & Gotchas

### Gotcha #1: The Orphaned Entities Trap (Garbage Collection)

Because relationships are stored only as ID arrays, deleting a parent entity does not automatically remove its child entities from the lookup store.

> [!WARNING]
> If a user is deleted from `state.users`, their post IDs (`[101, 102]`) remain in `state.posts` indefinitely. This creates **orphaned entities**, leading to progressive client-side memory leaks and bloated cache payloads.

#### Mitigation:

Implement cascading deletions in your state reducer/mutation logic to ensure children are cleaned up when parents are removed:

```javascript
function deleteUser(state, userId) {
  const user = state.users[userId];
  if (!user) return;

  // 1. Delete user's posts (cascading cleanup)
  user.posts.forEach((postId) => {
    delete state.posts[postId];
  });

  // 2. Delete the user
  delete state.users[userId];
}
```

### Gotcha #2: Selector Join Overhead (The React Rendering Trap)

To render a normalized list on the UI (e.g., rendering a User Card showing their actual post titles), we must perform a "join" by mapping the user's post ID array back to the post objects:

```javascript
// A selector running on every render loop
const selectUserPosts = (state, userId) => {
  const user = state.users[userId];
  return user ? user.posts.map((id) => state.posts[id]) : [];
};
```

> [!CAUTION]
> In libraries like React, `.map()` creates a **new array reference** on every call. If this selector runs during every render cycle of a parent component, it will trigger unnecessary re-renders of all child components, degrading UI responsiveness.

#### Mitigation:

Always wrap join operations in **memoized selectors** (e.g., using `reselect` or `useMemo` hooks) to ensure the join operation only recomputes when the underlying `users` or `posts` lookup tables actually change:

```javascript
import { createSelector } from 'reselect';

const selectUsers = (state) => state.users;
const selectPosts = (state) => state.posts;

// Memoized selector: only re-runs map if users or posts table references change
export const selectUserPostsMemoized = createSelector(
  [selectUsers, selectPosts, (state, userId) => userId],
  (users, posts, userId) => {
    const user = users[userId];
    return user ? user.posts.map((id) => posts[id]) : [];
  },
);
```
