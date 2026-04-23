import { v } from 'convex/values';
import {
  action,
  mutation,
  internalMutation,
  query,
  internalQuery,
} from './_generated/server';
import { embed, embedMany } from 'ai';
import { api } from './_generated/api';

const embeddingModel = 'openai/text-embedding-ada-002';

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter((i) => i !== '');
};

export const saveEmbedding = mutation({
  args: {
    content: v.string(),
    embeddings: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('embeddings', {
      content: args.content,
      embeddings: args.embeddings,
    });
  },
});

export const insertEmbedding = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chunks = generateChunks(args.content);

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });

    for (let i = 0; i < embeddings.length; i++) {
      await ctx.runMutation(api.embeddings.saveEmbedding, {
        content: chunks[i],
        embeddings: embeddings[i],
      });
    }

    return { success: true, count: embeddings.length };
  },
});

export const findRelevantContent = query({
  args: { id: v.id('embeddings') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const findRelevantContentAction = action({
  args: { userQuery: v.string() },
  handler: async (ctx, args) => {
    const input = args.userQuery.replaceAll('\\n', ' ');

    const { embedding: userQueryEmbedding } = await embed({
      model: embeddingModel,
      value: input,
    });

    const searchResults = await ctx.vectorSearch('embeddings', 'by_embedding', {
      vector: userQueryEmbedding,
      limit: 8,
    });

    const relevantResults = searchResults.filter(
      (result) => result._score > 0.8,
    );

    console.log('Vector search results:', relevantResults);

    const fullResults: Array<{ content: string; similarity: number }> =
      await Promise.all(
        relevantResults.map(async (result) => {
          const doc = await ctx.runQuery(api.embeddings.findRelevantContent, {
            id: result._id,
          });
          return {
            content: doc?.content || '',
            similarity: result._score || 0,
          };
        }),
      );

    return fullResults;
  },
});
