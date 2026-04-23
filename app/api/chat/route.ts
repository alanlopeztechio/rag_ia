import { api } from '@/convex/_generated/api';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from 'ai';
import { fetchAction, fetchMutation } from 'convex/nextjs';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: 'openai/gpt-4o',
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addResourse: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation. Then responsd with "Got it, I've added that to my knowledge base!"`,
        inputSchema: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) =>
          fetchAction(api.embeddings.insertEmbedding, { content }),
        outputSchema: z.object({
          success: z.boolean(),
          count: z
            .number()
            .describe('the number of chunks the content was split into'),
        }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          console.log('Fetching relevant content for question:', question);
          const response = await fetchAction(
            api.embeddings.findRelevantContentAction,
            {
              userQuery: question,
            },
          );

          console.log('Received relevant content:', response);
          return response;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
