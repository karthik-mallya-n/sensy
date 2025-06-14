"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import ResponseFormat from "./_components/ResponseFormat";

// Wrapper component that provides the SessionProvider
export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}

// Content component that uses the session
function HomeContent() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("Hi there");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedButton, setSelectedButton] = useState(0);
  

  const options = [
    { label: "DeepSeek", model : "deepseek/deepseek-r1-0528-qwen3-8b:free" },
    { label: "Nvidia", model : "nvidia/llama-3.1-nemotron-70b-instruct" },
    { label: "GPT-4o-Mini", model : "gpt-4o-mini"},
    { label: "Anthropic", model : "claude-sonnet-4-20250514"},

  ];

  const [obj,setOdj] = useState({
    label : options[0]?.label,
    model : options[0]?.model
  })

  const createChatMutation = api.chat.createChat.useMutation({
    onSuccess: (data) => {
      //@ts-expect-error Will ot be null
      setResponse(data?.fullMessage);
      console.log("Chat created successfully:", data?.fullMessage);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    createChatMutation.mutate({
      userId: session?.user.id ?? "",
      message,
      model: obj.model ?? "deepseek/deepseek-r1-0528-qwen3-8b:free",
      label: obj.label ?? "DeepSeek"
    });
  };

  const handleButton = (idx:number) => {
    setSelectedButton(idx);
    setOdj({
        label : options[idx]?.label,
        model : options[idx]?.model
    })
  }

  return (
    <main className="container mx-auto p-4">
      <div className="text-3xl font-bold mb-6">Welcome to {obj.label}</div>

      <div className="mb-4 flex gap-3">
        <button
          onClick={() => handleButton(0)}
          className={`font-medium py-2 px-4 rounded transition-colors duration-200 ${
            selectedButton === 0
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          DeepSeek
        </button>
        <button
          onClick={() => handleButton(1)}
          className={`font-medium py-2 px-4 rounded transition-colors duration-200 ${
            selectedButton === 1
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          Nvidia
        </button>
        <button
          onClick={() => handleButton(2)}
          className={`font-medium py-2 px-4 rounded transition-colors duration-200 ${
            selectedButton === 2
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          GPT-4o-Mini
        </button>

        <button
          onClick={() => handleButton(3)}
          className={`font-medium py-2 px-4 rounded transition-colors duration-200 ${
            selectedButton === 3
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          Claude-Sonnet-4-20250514
        </button>
        
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded p-2 min-h-[100px]"
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>

        </div>
      </form>

      {isLoading && (
        <div className="animate-pulse mt-4 rounded bg-gray-100 p-4">
          <p className="text-lg font-semibold">Waiting for response...</p>
        </div>
      )}

      {response && !isLoading && (
        <div className="mt-4 rounded bg-gray-100 p-4">
          <p className="text-lg font-semibold">Response from Model:</p>
          <ResponseFormat content={response} />
        </div>
      )}
    </main>
  );
}
