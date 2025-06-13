import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  const createChat = await api.chat.createChat({
    userId: session?.user.id || "",
    message: "Hi there",
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
  });

  return (
    <HydrateClient>
      <main>
        <div className="text-3xl font-bold">Welcome to Talk-2-Me</div>
        {createChat && (
          <div className="mt-4 rounded bg-gray-100 p-4">
            <p className="text-lg font-semibold">Response from Model:</p>
            <p className="mt-2">{createChat.content}</p>
          </div>
        )}
      </main>
    </HydrateClient>
  );
}
