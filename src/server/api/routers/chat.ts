import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import OpenAI from "openai";

// OPEN ROUTER'S API
// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

export const chatRouter = createTRPCRouter({
  createChat: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        message: z.string(),
        model: z.string(),
        label: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.label == "DeepSeek") {
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
            },
          });

          // Save the user message
          await ctx.db.message.create({
            data: {
              conversationId: conversation.id,
              sender: "USER",
              content: input.message,
              meta: {
                model: input.model,
              },
            },
          });

          // Save the assistant's response
          await ctx.db.message.create({
            data: {
              conversationId: conversation.id,
              sender: "ASSISTANT",
              content: completion.choices[0]?.message.content ?? "",
              meta: {
                model: input.model,
              },
            },
          });

          return { fullMessage: completion.choices[0]?.message.content };
        } catch (error: any) {
          return { fullMessage: "Error: " + error.message };
        }
      } else if (input.label == "Nvidia") {
        const client = new OpenAI({
          baseURL: "https://integrate.api.nvidia.com/v1",
          apiKey: process.env.NVIDIA_API_KEY,
        });

        try {
          const completion = await client.chat.completions.create({
            model: input.model,
            messages: [{ role: "user", content: input.message }],
            temperature: 0.5,
            top_p: 1,
            max_tokens: 1024,
            stream: true,
          });

          // Create a new conversation and save the messages
          const conversation = await ctx.db.conversation.create({
            data: {
              userId: "12345",
            },
          });

          // Save the user message
          await ctx.db.message.create({
            data: {
              conversationId: conversation.id,
              sender: "USER",
              content: input.message,
              meta: {
                model: input.model,
              },
            },
          });

          let fullMessage = "";

          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) fullMessage += content;
          }

          await ctx.db.message.create({
            data: {
              conversationId: conversation.id,
              sender: "ASSISTANT",
              content: fullMessage ?? "",
              meta: {
                model: input.model,
              },
            },
          });

          return { fullMessage };
        } catch (error: any) {
          return { fullMessage: "Error: " + error.message };
        }
      } else if (input.label == "GPT-4o-Mini") {
        const openai = new OpenAI({
          apiKey: process.env.GPT_4O_MINI_API_KEY ?? "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",
        });

        try {
          const completion = await openai.chat.completions.create({
          model: input.model,
          store: true,
          messages: [{ role: "user", content: input.message }],
        });
        
          return { fullMessage : completion.choices[0]?.message}
        } catch (err : any) {
          return { fullMessage : "Error : "+ err.message}
        }
        
        // completion.then((result) => console.log(result.choices[0].message));
      }
    }),
});
