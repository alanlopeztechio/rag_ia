import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_created', ['createdAt'])
    .searchIndex('search_text', {
      searchField: 'text',
    }),
  embeddings: defineTable({
    content: v.string(),
    embeddings: v.array(v.float64()),
  }).vectorIndex('by_embedding', {
    vectorField: 'embeddings',
    dimensions: 1536,
  }),
});
