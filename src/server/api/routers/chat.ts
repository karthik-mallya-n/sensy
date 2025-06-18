import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  //-------------------------------Get all chats for a user
  getChats: protectedProcedure
    .query(async ({ ctx }) => {
      const conversations = await ctx.db.conversation.findMany({
        where: { userId: ctx.session.user.id },  // derive from session
        orderBy: { updatedAt: "desc" },          // show most recent first
      });
      return conversations;
    }),


  //-------------------------------Get messages for a specific chat
  getMessagesForChat: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Validate ownership
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,  // Derive from session
        },
      });
      if (!conversation) throw new Error("Not authorized to view this conversation");

      // Fetch messages
      const messages = await ctx.db.messageResponsePair.findMany({
        where: { conversationId: input.conversationId },
        include: {
          userMessage: true,
          assistantMessage: true,
        },
        orderBy: { createdAt: "asc" },
        take: 50, // optional: add pagination
      });

      return messages;
    }),


  //-------------------------------Create a new chat
  createChat: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        message: z.string(),
        model: z.string(),
        label: z.string(),
        webSearch: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `
You are an AI assistant. Your *highest priority* is to return output in **valid, clean, and well-structured Markdown** that looks correct in any Markdown viewer or editor.

✅ **Markdown formatting rules you must follow strictly**:
- Use proper heading levels: \`#\`, \`##\`, \`###\`, etc., in the correct hierarchy. Never skip levels (e.g., don’t go from \`#\` directly to \`###\`).
- Use lists with \`-\`, \`*\`, or ordered \`1.\`, \`2.\` etc. syntax. Indent subitems consistently with at least 2 spaces.
- Always leave a blank line after headings and before/after lists or code blocks to ensure proper rendering.
- if the user asks for code, always wrap it inside fenced code blocks using triple backticks (\\\`\\\`\\\`) and specify the correct language tag (e.g., \`java\`, \`python\`, \`javascript\`). Never provide inline or un-fenced code if it’s a block.
- Inline code (e.g., \`variableName\`) should use single backticks.
- If including blockquotes, tables, or links, ensure they follow valid Markdown syntax.

❗ **Never output code, headings, lists, or other structures without proper Markdown syntax. Never mix styles within the same output (e.g., don’t switch between \`-\` and \`*\` in one list). Never sacrifice clarity for compactness.**
`;

      async function fetchWebSearchResults(query: string): Promise<string> {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Search API failed");
          const data = await res.json();

          const abstract = data.AbstractText || '';
          const related = (data.RelatedTopics || [])
            .slice(0, 3)
            .map((t: any) => t.Text)
            .filter(Boolean)
            .join("\n");

          return `## Web Search Results\n\n${abstract}\n\n${related}`;
        } catch (err) {
          console.error("Web search error", err);
          return "⚠️ Web search failed or returned no data.";
        }
      }

      async function saveConversation(userMessage: string, assistantMessage: string) {
        const conversation = await ctx.db.conversation.create({
          data: {
            branchedId: input.conversationId ?? undefined,
            userId: ctx.session.user.id,
            model: input.model,
          },
        });

        const user = await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "USER",
            content: userMessage,
          },
        });

        const assistant = await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "ASSISTANT",
            content: assistantMessage,
          },
        });

        await ctx.db.messageResponsePair.create({
          data: {
            conversationId: conversation.id,
            userMessageId: user.id,
            assistantMessageId: assistant.id,
          },
        });

        return conversation;
      }

      // Prepare message with optional web search results
      let userMessage = input.message;
      if (input.webSearch) {
        const searchResults = await fetchWebSearchResults(input.message);
        userMessage = `${searchResults}\n\nUser query: ${input.message}`;
      }

      // Handle different models
      if (input.label === "DeepSeek") {
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
        });

        try {
          const completion = await openai.chat.completions.create({
            model: input.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });

          const assistantMsg = completion.choices[0]?.message.content ?? "";
          const conversation = await saveConversation(userMessage, assistantMsg);
          return { fullMessage: assistantMsg, conversation };
        } catch (error: any) {
          return { fullMessage: "Error: " + error.message };
        }
      }

      if (input.label === "Nvidia") {
        const client = new OpenAI({
          baseURL: "https://integrate.api.nvidia.com/v1",
          apiKey: process.env.NVIDIA_API_KEY,
        });

        try {
          const completion = await client.chat.completions.create({
            model: input.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.5,
            top_p: 1,
            max_tokens: 1024,
            stream: true,
          });

          let fullMessage = "";
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) fullMessage += content;
          }

          const conversation = await saveConversation(userMessage, fullMessage);
          return { fullMessage, conversation };
        } catch (error: any) {
          return { fullMessage: "Error: " + error.message };
        }
      }

      if (input.label === "GPT-4o-Mini") {
        const openai = new OpenAI({
          apiKey: process.env.GPT_4O_MINI_API_KEY,
        });

        try {
          const completion = await openai.chat.completions.create({
            model: input.model,
            store: true,
            messages: [{ role: "user", content: userMessage }],
          });

          const assistantMsg = completion.choices[0]?.message.content || "No response";
          const conversation = await saveConversation(userMessage, assistantMsg);
          return { fullMessage: assistantMsg, conversation };
        } catch (err: any) {
          return { fullMessage: "Error: " + err.message };
        }
      }

      if (input.label === "Anthropic") {
        const anthropic = new Anthropic({
          apiKey: process.env.CLAUDE_API_KEY,
        });

        try {
          const msg = await anthropic.messages.create({
            model: input.model,
            max_tokens: 1024,
            messages: [{ role: "user", content: userMessage }],
          });

          const fullMessage = msg.content
            .filter((block) => block.type === 'text')
            .map((block) => 'text' in block ? block.text : '')
            .join('');

          const conversation = await saveConversation(userMessage, fullMessage);
          return { fullMessage, conversation };
        } catch (err: any) {
          return { fullMessage: "Error: " + err.message };
        }
      }

      if (input.label === "Gemini") {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: userMessage }],
                  },
                ],
              }),
            },
          );

          const data = await res.json();
          const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Content";
          const conversation = await saveConversation(userMessage, content);
          return { fullMessage: content, conversation };
        } catch (err: any) {
          return { fullMessage: "Error: " + err.message };
        }
      }

      return { fullMessage: "Unsupported model label" };
    }),


  //-------------------------------Follow up chat with context
  followUpChat: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        message: z.string(),
        model: z.string(),
        label: z.string(),
        webSearch: z.boolean().optional().default(false), // ✅ Add webSearch flag
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1️⃣ Fetch chat history
      const messages = await ctx.db.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      let chatHistory = messages.map((msg) => ({
        role:
          msg.sender === "USER"
            ? "user"
            : msg.sender === "ASSISTANT"
              ? "assistant"
              : "system",
        content: msg.content,
      }));

      chatHistory.push({
        role: "user",
        content: input.message,
      });

      // 2️⃣ If webSearch is requested, fetch search info
      if (input.webSearch) {
        try {
          const searchRes = await fetch(
            `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(input.message)}&count=3`,
          );
          const searchData = await searchRes.json();

          const abstract = searchData.AbstractText || "";
          const relatedTopics = searchData.RelatedTopics?.slice(0, 3).map((t: any) => t.Text).join("\n") || "";

          const webSummary = `# Web Search Summary

${abstract}

${relatedTopics}
        `;

          // Prepend search summary to context
          chatHistory.unshift({
            role: "system",
            content: `The following info is from a web search related to the user query:\n\n${webSummary}`
          });
          console.log("web summary:", webSummary);
        } catch (err) {
          console.error("Web search failed", err);
          chatHistory.unshift({
            role: "system",
            content: `Web search failed. Proceed without it.`
          });
        }
      }

      async function generateResponse() {
        if (input.label === "DeepSeek") {
          const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
          });
          const completion = await openai.chat.completions.create({
            model: input.model,
            // @ts-ignore
            messages: chatHistory,
          });
          return completion.choices[0]?.message.content ?? "";
        }

        if (input.label === "Nvidia") {
          const client = new OpenAI({
            baseURL: "https://integrate.api.nvidia.com/v1",
            apiKey: process.env.NVIDIA_API_KEY,
          });
          const completion = await client.chat.completions.create({
            model: input.model,
            // @ts-ignore
            messages: chatHistory,
            temperature: 0.5,
            top_p: 1,
            max_tokens: 1024,
            stream: true,
          });

          let fullMessage = "";
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) fullMessage += content;
          }
          return fullMessage;
        }

        if (input.label === "GPT-4o-Mini") {
          const openai = new OpenAI({
            apiKey: process.env.GPT_4O_MINI_API_KEY,
          });
          const completion = await openai.chat.completions.create({
            model: input.model,
            store: true,
            // @ts-ignore
            messages: chatHistory,
          });
          return completion.choices[0]?.message?.content ?? "";
        }

        if (input.label === "Anthropic") {
          const anthropic = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
          });
          const msg = await anthropic.messages.create({
            model: input.model,
            max_tokens: 1024,
            // @ts-ignore
            messages: chatHistory,
          });
          return msg.content
            ?.filter((block) => block.type === 'text')
            .map((block) => 'text' in block ? block.text : '')
            .join('') ?? "";
        }

        if (input.label === "Gemini") {
          const geminiContents = chatHistory.map((msg) => ({
            role: msg.role === "assistant" ? "model" : msg.role,
            parts: [{ text: msg.content }],
          }));

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: geminiContents,
              }),
            }
          );

          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message ?? "Gemini API error");

          return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Content";
        }

        throw new Error("Unsupported provider label");
      }

      try {
        // 3️⃣ Generate AI response
        const assistantContent = await generateResponse();

        // 4️⃣ Save messages
        const userMsg = await ctx.db.message.create({
          data: {
            conversationId: input.conversationId,
            sender: "USER",
            content: input.message,
          },
        });

        const assistantMsg = await ctx.db.message.create({
          data: {
            conversationId: input.conversationId,
            sender: "ASSISTANT",
            content: assistantContent,
          },
        });

        await ctx.db.messageResponsePair.create({
          data: {
            conversationId: input.conversationId,
            userMessageId: userMsg.id,
            assistantMessageId: assistantMsg.id,
          },
        });

        return { fullMessage: assistantContent };
      } catch (err: any) {
        return { fullMessage: "Error: " + (err.message ?? "Unknown error") };
      }
    }),


  //-------------------------------Delete a chat
  deleteChat: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
      });

      if (!conversation || conversation.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed to delete this conversation' });
      }

      try {
        await ctx.db.conversation.delete({
          where: { id: input.conversationId },
        });

        return { success: true, conversationId: input.conversationId };
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found or already deleted',
        });
      }
    }),


  //-------------------------------Update user message and regenerate assistant response
  updateUserMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        label: z.string(),
        model: z.string(),
        newUserMessage: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pair = await ctx.db.messageResponsePair.findUnique({
        where: { userMessageId: input.messageId },
        include: {
          conversation: true,
          userMessage: true,
          assistantMessage: true,
        },
      });

      if (!pair) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message pair not found' });
      }

      if (pair.conversation.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed to update this message' });
      }

      await ctx.db.message.update({
        where: { id: pair.userMessageId },
        data: { content: input.newUserMessage },
      });

      const messages = await ctx.db.message.findMany({
        where: { conversationId: pair.conversationId },
        orderBy: { createdAt: "asc" },
      });

      const chatHistory = messages.map((msg) => ({
        role:
          msg.sender === "USER" ? "user" : msg.sender === "ASSISTANT" ? "assistant" : "system",
        content: msg.content,
      }));

      const index = messages.findIndex(msg => msg.id === pair.userMessageId);
      if (index !== -1) {
        chatHistory[index] = {
          role: "user",
          content: input.newUserMessage,
        };
      }

      let newAssistantContent = "";
      // 🟢 model API calls (same as your original code) ...

      // e.g. for Gemini (full context):
      if (input.label === "Gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: chatHistory.map(h => ({
                parts: [{ text: h.content }]
              }))
            }),
          }
        );
        const data = await res.json();
        newAssistantContent = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Content";
      }

      if (pair.assistantMessageId) {
        await ctx.db.message.update({
          where: { id: pair.assistantMessageId },
          data: { content: newAssistantContent },
        });
      } else {
        const newAssistant = await ctx.db.message.create({
          data: {
            conversationId: pair.conversationId,
            sender: "ASSISTANT",
            content: newAssistantContent,
          },
        });

        await ctx.db.messageResponsePair.update({
          where: { userMessageId: input.messageId },
          data: { assistantMessageId: newAssistant.id },
        });
      }

      return {
        updatedUserMessage: input.newUserMessage,
        updatedAssistantMessage: newAssistantContent,
      };
    }),

  renameChat: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        newTitle: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, newTitle } = input;

      // Ensure the chat belongs to the logged-in user
      const chat = await ctx.db.conversation.findFirst({
        where: {
          id: conversationId,
          userId: ctx.session.user.id,
        },
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found or you don't have permission to edit it.",
        });
      }

      // Update the title
      const updatedChat = await ctx.db.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title: newTitle,
        },
      });

      return updatedChat;
    }),
});
