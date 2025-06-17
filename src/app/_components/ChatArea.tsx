"use client";
import { useState, useRef, useEffect } from "react";
import ResponseFormat from "./ResponseFormat";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ChatMessage {
  id: number;
  text: string;
  sender?: "user" | "bot"; // optional, for styling
}

export default function ChatArea({ messages }: { messages: ChatMessage[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCopy = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="flex-1 pt-16 px-4 pb-48 flex flex-col gap-3 mx-auto w-full"
      style={{
        maxWidth: "1700px",
        position: "relative",
      }}
    >
      {messages.length === 0 && (
        <div className="text-gray-400 italic text-center mt-10"></div>
      )}
      {messages.map(({ id, text, sender }) => (
        <div
          key={id}
          className={`w-full flex flex-col ${sender === "user" ? "items-start" : "items-start"
            }`}
        >
          {/* This flex container controls message bubble horizontal placement */}
          <div
            className={`w-full flex ${sender === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`pl-4 pr-4 pt-3 pb-3 rounded-xl break-words ${sender === "user"
                  ? "max-w-[75%] mx-97 mt-6 text-white text-left bg-[rgba(13,25,25,0.2)] backdrop-blur-xs border border-[#2D3838]/60 shadow-md"
                  : "w-[1000px] mx-85 mt-3 text-white text-left bg-transparent"
                }`}
            >
              {sender === "bot" ? (
                <ResponseFormat content={text} />
              ) : (
                <div>{text}</div>
              )}
            </div>
          </div>

          {/* Copy button below user message box */}
          {sender === "user" && (
            <button
              onClick={() => handleCopy(text, id)}
              className="mt-4 ml-312 flex items-center gap-1 rounded-md bg-transparent px-1 text-xs text-gray-300 hover:text-white transition"
              aria-label="Copy message"
            >
              {copiedId === id ? (
                <>
                  <CheckIcon className="h-4 w-4 text-white" />
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      ))}

      {/* Reference for scrolling to bottom */}
      <div ref={messagesEndRef}></div>
    </div>
  );
}
