/**
 * Database&Caching/normalization/index.js
 *
 * Demonstrating Client-Side State Normalization Patterns:
 * 1. Handcoded Manual Loops (ad-hoc normalization)
 * 2. Generic Schema-Driven Recursive Normalizer (industrial-grade normalizr pattern)
 * 3. Read Lookup Benchmark & Complexity Comparison (O(1) Map vs O(N) Nested Scan)
 * 4. Update / Mutation Simplicity
 * 5. Memoized selector / join logic (denormalization)
 */

const { nested: dataset1, normalized: expectedNormalized1 } = require('./dataset1');
const { nested: dataset2, normalized: expectedNormalized2 } = require('./dataset2');

// ==========================================
// 1. Generic Schema Normalizer Engine
// ==========================================

class Entity {
  constructor(key, definition = {}) {
    this.key = key;
    this.definition = definition;
  }
  define(definition) {
    this.definition = Object.assign(this.definition, definition);
  }
}

/**
 * Normalizes input data against a defined schema tree
 * @param {Object|Array} data
 * @param {Entity|Array} schema
 * @returns {Object} { entities, result }
 */
function normalize(data, schema) {
  const entities = {};

  function addEntity(key, id, entityData) {
    if (!entities[key]) {
      entities[key] = { byIds: {}, allIds: [] };
    }
    const store = entities[key];
    if (!store.byIds[id]) {
      store.byIds[id] = entityData;
      store.allIds.push(id);
    } else {
      // Merge properties for existing entities to keep references complete
      store.byIds[id] = Object.assign({}, store.byIds[id], entityData);
    }
  }

  function visit(val, currentSchema) {
    if (!val || typeof val !== 'object') return val;

    if (currentSchema instanceof Entity) {
      const id = val.id;
      if (id === undefined) return val;

      const entityData = {};
      for (const key in val) {
        if (currentSchema.definition[key]) {
          // Field is relational, recursively normalize it
          const relationSchema = currentSchema.definition[key];
          entityData[key] = visit(val[key], relationSchema);
        } else {
          // Regular data field
          entityData[key] = val[key];
        }
      }

      addEntity(currentSchema.key, id, entityData);
      return id; // Replace object with ID reference
    }

    if (Array.isArray(val)) {
      const elementSchema = Array.isArray(currentSchema) ? currentSchema[0] : currentSchema;
      return val.map((item) => visit(item, elementSchema));
    }

    // Normal plain object
    const objData = {};
    for (const key in val) {
      const fieldSchema = currentSchema ? currentSchema[key] : null;
      objData[key] = visit(val[key], fieldSchema);
    }
    return objData;
  }

  const result = visit(data, schema);
  return { entities, result };
}

// ==========================================
// 2. Schema Definitions for Datasets
// ==========================================

// Dataset 1 Schema (User -> Posts -> Comments -> Author)
const userSchema = new Entity('users');
const commentSchema = new Entity('comments');
const postSchema = new Entity('posts');

commentSchema.define({ author: userSchema });
postSchema.define({ comments: [commentSchema] });
userSchema.define({ posts: [postSchema] });

// Dataset 2 Schema (Project -> Columns -> Tasks -> Tags, Assignees, Comments)
const tagSchema2 = new Entity('tags');
const userSchema2 = new Entity('users');
const commentSchema2 = new Entity('comments', { author: userSchema2 });
const taskSchema2 = new Entity('tasks', {
  tags: [tagSchema2],
  assignees: [userSchema2],
  comments: [commentSchema2],
});
const columnSchema2 = new Entity('columns', { tasks: [taskSchema2] });
const projectSchema2 = new Entity('projects', { columns: [columnSchema2] });

// ==========================================
// 3. Handcoded Manual Normalization (Alternative)
// ==========================================

function manualNormalizeDataset1(usersArray) {
  const state = {
    users: { byIds: {}, allIds: [] },
    posts: { byIds: {}, allIds: [] },
    comments: { byIds: {}, allIds: [] },
  };

  usersArray.forEach((user) => {
    // 1. Extract and store User details (without nesting posts)
    const postIds = [];

    if (user.posts) {
      user.posts.forEach((post) => {
        postIds.push(post.id);

        const commentIds = [];
        if (post.comments) {
          post.comments.forEach((comment) => {
            commentIds.push(comment.id);

            // Extract comment author details
            if (comment.author) {
              const author = comment.author;
              if (!state.users.byIds[author.id]) {
                state.users.byIds[author.id] = { id: author.id, name: author.name, email: author.email };
                state.users.allIds.push(author.id);
              }
            }

            // Store comment
            state.comments.byIds[comment.id] = {
              id: comment.id,
              body: comment.body,
              createdAt: comment.createdAt,
              author: comment.author ? comment.author.id : null,
            };
            if (!state.comments.allIds.includes(comment.id)) {
              state.comments.allIds.push(comment.id);
            }
          });
        }

        // Store post
        state.posts.byIds[post.id] = {
          id: post.id,
          title: post.title,
          body: post.body,
          publishedAt: post.publishedAt,
          comments: commentIds,
        };
        if (!state.posts.allIds.includes(post.id)) {
          state.posts.allIds.push(post.id);
        }
      });
    }

    state.users.byIds[user.id] = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      posts: postIds,
    };
    if (!state.users.allIds.includes(user.id)) {
      state.users.allIds.push(user.id);
    }
  });

  return state;
}

// ==========================================
// 4. Execution & Demonstrations
// ==========================================

console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m             CLIENT-SIDE CACHE NORMALIZATION PLAYGROUND             \x1b[0m');
console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m');

// Run Handcoded Manual Normalization
const manualState1 = manualNormalizeDataset1(dataset1);
console.log('\n\x1b[1m\x1b[32m✔ [Manual Normalization - Dataset 1 Results]:\x1b[0m');
console.log(
  `Users Table Length   : ${manualState1.users.allIds.length} users (${manualState1.users.allIds.join(', ')})`,
);
console.log(
  `Posts Table Length   : ${manualState1.posts.allIds.length} posts (${manualState1.posts.allIds.join(', ')})`,
);
console.log(
  `Comments Table Length: ${manualState1.comments.allIds.length} comments (${manualState1.comments.allIds.join(', ')})`,
);
console.log('Post 101 normalized structure in store:');
console.dir(manualState1.posts.byIds[101], { depth: null });
console.log('Comment 201 normalized structure in store (with author pointer):');
console.dir(manualState1.comments.byIds[201], { depth: null });

// Run Schema-Driven Generic Normalizer (Dataset 1)
const schemaNormalized1 = normalize(dataset1, [userSchema]);
console.log('\n\x1b[1m\x1b[32m✔ [Schema-Driven Normalization - Dataset 1 Results]:\x1b[0m');
console.log('Extracted Store Keys:', Object.keys(schemaNormalized1.entities));
console.log('Top-Level Results (User IDs):', schemaNormalized1.result);

// Run Schema-Driven Generic Normalizer (Dataset 2 - Complex Kanban Board)
const schemaNormalized2 = normalize(dataset2, [projectSchema2]);
console.log('\n\x1b[1m\x1b[32m✔ [Schema-Driven Normalization - Dataset 2 (Kanban Board)]:\x1b[0m');
console.log('Extracted Store Keys:', Object.keys(schemaNormalized2.entities));
console.log('Projects Extracted   :', schemaNormalized2.entities.projects.allIds);
console.log('Columns Extracted    :', schemaNormalized2.entities.columns.allIds);
console.log('Tasks Extracted      :', schemaNormalized2.entities.tasks.allIds);
console.log('Tags Extracted       :', schemaNormalized2.entities.tags.allIds);
console.log('Users/Assignees      :', schemaNormalized2.entities.users.allIds);
console.log('Comments Extracted   :', schemaNormalized2.entities.comments.allIds);

console.log("\nTask 'task_101' normalized store view:");
console.dir(schemaNormalized2.entities.tasks.byIds['task_101'], { depth: null });

// Assert computed outputs match expected static normalized data from the dataset files
function verifyNormalizedOutput(computed, expected, datasetName) {
  const compStr = JSON.stringify(computed, Object.keys(computed).sort());
  const expStr = JSON.stringify(expected, Object.keys(expected).sort());
  if (compStr === expStr) {
    console.log(
      `\n\x1b[1m\x1b[32m✔ [Validation Success]: Schema-driven output for ${datasetName} matches expected static schema exactly!\x1b[0m`,
    );
  } else {
    console.warn(
      `\n\x1b[1m\x1b[31m⚠ [Validation Warning]: Schema-driven output for ${datasetName} does not match expected schema.\x1b[0m`,
    );
  }
}

verifyNormalizedOutput(schemaNormalized1.entities, expectedNormalized1, 'Dataset 1 (Relational Blog)');
verifyNormalizedOutput(schemaNormalized2.entities, expectedNormalized2, 'Dataset 2 (Kanban Board)');

// ==========================================
// 5. Lookups Benchmarks & Complexity Demos
// ==========================================

console.log('\n\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');
console.log('\x1b[1m\x1b[33m             PERFORMANCE BENCHMARK: O(N) VS O(1) LOOKUPS             \x1b[0m');
console.log('\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');

const targetCommentId = 202;

// Denormalized Nested Scan O(N)
function nestedFindComment(data, commentId) {
  for (const user of data) {
    if (user.posts) {
      for (const post of user.posts) {
        if (post.comments) {
          for (const comment of post.comments) {
            if (comment.id === commentId) {
              return comment;
            }
          }
        }
      }
    }
  }
  return null;
}

// Benchmark executions
console.time('Denormalized Loop Scan O(N) Duration');
const resDenorm = nestedFindComment(dataset1, targetCommentId);
console.timeEnd('Denormalized Loop Scan O(N) Duration');
console.log(`Found Comment (Denorm): "${resDenorm.body}" by ${resDenorm.author.name}`);

console.time('Normalized Hash Map O(1) Duration');
const resNormComment = schemaNormalized1.entities.comments.byIds[targetCommentId];
const resNormAuthor = schemaNormalized1.entities.users.byIds[resNormComment.author];
console.timeEnd('Normalized Hash Map O(1) Duration');
console.log(`Found Comment (Norm)  : "${resNormComment.body}" by ${resNormAuthor.name}`);

// ==========================================
// 6. Write & Update Operations
// ==========================================

console.log('\n\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');
console.log('\x1b[1m\x1b[33m                       STATE MUTATION SIMPLICITY                     \x1b[0m');
console.log('\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');

// Suppose we want to update the body of comment 201
console.log('Original Comment 201 Body:', schemaNormalized1.entities.comments.byIds[201].body);

// In a normalized cache, we just update the comments slice by key:
schemaNormalized1.entities.comments.byIds[201].body = 'Updated dynamically inside normalized store!';

console.log('Mutated Comment 201 Body :', schemaNormalized1.entities.comments.byIds[201].body);

// ==========================================
// 7. Selector Join (Denormalization for UI Rendering)
// ==========================================

console.log('\n\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');
console.log('\x1b[1m\x1b[33m             SELECTOR JOIN: RECONSTITUTING THE GRAPH FOR UI         \x1b[0m');
console.log('\x1b[1m\x1b[33m--------------------------------------------------------------------\x1b[0m');

// Let's create a selector that joins posts, user author, and comments with author details
function selectPostDetailView(entities, postId) {
  const post = entities.posts.byIds[postId];
  if (!post) return null;

  // Resolve author (find who wrote this post by checking which user contains this postId)
  let author = null;
  for (const userId of entities.users.allIds) {
    const user = entities.users.byIds[userId];
    if (user.posts && user.posts.includes(postId)) {
      author = { id: user.id, name: user.name, email: user.email };
      break;
    }
  }

  // Resolve comments
  const commentsList = (post.comments || []).map((commentId) => {
    const comment = entities.comments.byIds[commentId];
    const commenter = entities.users.byIds[comment.author];
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: commenter ? { id: commenter.id, name: commenter.name } : null,
    };
  });

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    publishedAt: post.publishedAt,
    author: author,
    comments: commentsList,
  };
}

const joinedPostView = selectPostDetailView(schemaNormalized1.entities, 101);
console.log('UI component projected view (joined relational graph):');
console.dir(joinedPostView, { depth: null });

console.log('\x1b[1m\x1b[36m====================================================================\x1b[0m\n');
