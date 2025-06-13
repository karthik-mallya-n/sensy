import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import OpenAI from "openai";

// OPEN ROUTER'S API
// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

export const chatRouter = createTRPCRouter({
  createChat: protectedProcedure
    .input(
      z.object({ userId: z.string(), message: z.string(), model: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      try {
        // Create a chat completion using OpenRouter API
        const completion = await openai.chat.completions.create({
          model: input.model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: input.message,
                },
              ],
            },
          ],
        });

        // Create a new conversation and save the messages
        const conversation = await ctx.db.conversation.create({
          data: {
            userId: "12345",
          }
        });

        // Save the user message
        await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "USER",
            content: input.message,
            meta: {
              model: input.model,
            }
          }
        });

        // Save the assistant's response
        await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "ASSISTANT",
            content: completion.choices[0]?.message.content ?? "",
            meta: {
              model: input.model,
            }
          }
        });

        return { content: completion.choices[0]?.message.content };
      } catch (error: any) {
        return { content: "Error: " + error.message };
      }

    }),
});
