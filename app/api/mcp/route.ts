import { z } from 'zod';
import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { verifyClerkToken } from '@clerk/mcp-tools/next';

const clerk = await clerkClient();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_todos',
      { description: 'Get the list of all todos' },
      async ({ authInfo }) => {
        const todos = await convex.query(api.todos.list);
        return {
          content: [{ type: 'text', text: JSON.stringify(todos, null, 2) }],
        };
      },
    );
    server.registerTool(
      'create_todo',
      {
        description: 'Create a new todo item',
        inputSchema: { text: z.string() },
      },
      async ({ text }) => {
        const id = await convex.mutation(api.todos.create, { text });
        return {
          content: [{ type: 'text', text: `Created todo with ID: ${id}` }],
        };
      },
    );
    server.registerTool(
      'toggle_todo',
      {
        description: 'Toggle the completed state of a todo item',
        inputSchema: { id: z.string() },
      },
      async ({ id }) => {
        await convex.mutation(api.todos.toggleComplete, { id: id as any });
        return {
          content: [
            { type: 'text', text: `Toggled completion status for todo: ${id}` },
          ],
        };
      },
    );

    server.registerTool(
      'delete_todo',
      {
        description: 'Delete a todo item',
        inputSchema: { id: z.string() },
      },
      async ({ id }) => {
        await convex.mutation(api.todos.deleteTodo, { id: id as any });
        return {
          content: [{ type: 'text', text: `Deleted todo: ${id}` }],
        };
      },
    );
  },
  {},
  { basePath: '/api', verboseLogs: true },
);

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerkAuth = await auth({ acceptsToken: 'oauth_token' });
    return verifyClerkToken(clerkAuth, token);
  },
  {
    required: true,
    resourceMetadataPath: '/.well-known/oauth-protected-resource/mcp',
  },
);

export { authHandler as GET, authHandler as POST };
