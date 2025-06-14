import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  const createChat = await api.chat.createChat({
    userId: session?.user.id ?? "",
    message: "Hi there",
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
  });

  return (
    <HydrateClient>
      <main>
        {createChat && (
            <div>{createChat.content}</div>
        )}
      </main>
    </HydrateClient>
  );
}