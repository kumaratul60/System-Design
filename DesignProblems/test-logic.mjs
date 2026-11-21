import assert from 'node:assert';

console.log('Testing infinite scroll logic constraints...');

const LIMIT = 10;
const fetchedSkips = new Set();
const seenProductIds = new Set();
let loadedProducts = [];
let currentSkip = 0;
let hasMore = true;
let isLoading = false;

const totalItems = 25;
function mockFetch(skip, limit) {
  if (skip >= totalItems) {
    return { products: [], total: totalItems, skip, limit };
  }
  const count = Math.min(limit, totalItems - skip);
  const products = Array.from({ length: count }, (_, i) => ({
    id: skip + i + 1,
    title: `Product ${skip + i + 1}`,
  }));
  return { products, total: totalItems, skip, limit };
}

async function loadChunk(skipToFetch) {
  if (isLoading || fetchedSkips.has(skipToFetch) || !hasMore) {
    return false;
  }

  isLoading = true;
  fetchedSkips.add(skipToFetch);

  const data = mockFetch(skipToFetch, LIMIT);

  const newItems = [];
  for (const item of data.products) {
    if (!seenProductIds.has(item.id)) {
      seenProductIds.add(item.id);
      newItems.push(item);
    }
  }

  loadedProducts = [...loadedProducts, ...newItems];
  currentSkip = skipToFetch + LIMIT;

  if (currentSkip >= data.total || data.products.length === 0) {
    hasMore = false;
  }

  isLoading = false;
  return true;
}

// 1. Initial fetch at skip=0
const firstCall = await loadChunk(0);
assert.strictEqual(firstCall, true);
assert.strictEqual(loadedProducts.length, 10);
assert.strictEqual(currentSkip, 10);
assert.strictEqual(hasMore, true);

// 2. Prevent duplicate request for same skip=0
const duplicateCall = await loadChunk(0);
assert.strictEqual(duplicateCall, false);
assert.strictEqual(loadedProducts.length, 10);

// 3. Second chunk (skip=10)
const secondCall = await loadChunk(currentSkip);
assert.strictEqual(secondCall, true);
assert.strictEqual(loadedProducts.length, 20);
assert.strictEqual(currentSkip, 20);

// 4. Third chunk (skip=20), reaching end
const thirdCall = await loadChunk(currentSkip);
assert.strictEqual(thirdCall, true);
assert.strictEqual(loadedProducts.length, 25);
assert.strictEqual(hasMore, false);

// 5. Overfetch guard
const overfetchCall = await loadChunk(currentSkip);
assert.strictEqual(overfetchCall, false);

console.log('All constraint tests passed successfully!');
