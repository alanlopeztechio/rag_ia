import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('todos').order('desc').collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTodoId = await ctx.db.insert('todos', {
      text: args.text,
      completed: false,
      createdAt: Date.now(),
    });
    return newTodoId;
  },
});

export const toggleComplete = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    await ctx.db.patch(args.id, { completed: !todo.completed });
  },
});

export const deleteTodo = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: { id: v.id('todos'), text: v.string() },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    await ctx.db.patch(args.id, { text: args.text });
  },
});
