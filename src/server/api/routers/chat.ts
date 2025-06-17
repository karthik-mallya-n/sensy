import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

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

---

### **Example — Country and its wonders**
## Egypt

- Pyramids of Giza  
- Sphinx of Giza  
- Valley of the Kings  

---

### **Example — Code**

\`\`\`java
// Example Java code
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
\`\`\`

\`\`\`python
# Example Python code
def greet():
    print("Hello, world!")
greet()
\`\`\`

---

⚠️ Always check your output structure to ensure it will render cleanly in Markdown. The **formatting is as important as the content**.
`;

      async function saveConversation(
        userMessage: string,
        assistantMessage: string,
      ) {
        const conversation = await ctx.db.conversation.create({
          data: {
            userId: input.userId,
          },
        });

        await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "USER",
            content: userMessage,
            meta: {
              model: input.model,
            },
          },
        });

        await ctx.db.message.create({
          data: {
            conversationId: conversation.id,
            sender: "ASSISTANT",
            content: assistantMessage,
            meta: {
              model: input.model,
            },
          },
        });
      }

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
              { role: "user", content: input.message }, // FIXED: plain string content
            ],
          });

          const assistantMsg = completion.choices[0]?.message.content ?? "";
          await saveConversation(input.message, assistantMsg);

          return { fullMessage: assistantMsg };
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
              { role: "user", content: input.message },
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

          await saveConversation(input.message, fullMessage);
          return { fullMessage };
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
            messages: [{ role: "user", content: input.message }],
          });

          return { fullMessage: completion.choices[0]?.message };
        } catch (err: any) {
          return { fullMessage: "Error : " + err.message };
        }

        // completion.then((result) => console.log(result.choices[0].message));
      }

      if (input.label === "Anthropic") {
        const anthropic = new Anthropic({
          apiKey: process.env.CLAUDE_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
        });

        try {
          const msg = await anthropic.messages.create({
            model: input.model,
            max_tokens: 1024,
            messages: [{ role: "user", content: input.message }],
          });

          return { fullMessage: msg };
        } catch (err: any) {
          return { fullMessage: "Error : " + err.message };
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
                    parts: [{ text: input.message }],
                  },
                ],
              }),
            },
          );

          const data = await res.json();
          const content : string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Content"; 
          return {fullMessage : content}
        } catch (err : any) {
          return {fullMessage : err.message}
        }
      }
    }),
});
