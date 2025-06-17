"use client";
import ResponseFormat from "./ResponseFormat";
interface ChatMessage {
  id: number;
  text: string;
  sender?: "user" | "bot"; // optional, for styling
}

export default function ChatArea({ messages }: { messages: ChatMessage[] }) {
  return (
    <div
      className="flex-1 overflow-auto p-4 flex flex-col gap-3 mx-auto"
      style={{
        maxHeight: "calc(100% - 140px)", // leave room for input box height
        maxWidth: "900px", // max width to keep content centered
        width: "100%", // full width up to maxWidth
      }}
    >
      {messages.length === 0 && (
        <div className="text-gray-400 italic text-center mt-10">
        </div>
      )}

      {messages.map(({ id, text, sender }) => (
        <div
          key={id}
          className={`max-w-[75%] pl-4 pr-4 pt-3 pb-3 rounded-xl break-words ${
            sender === "user"
              ? "self-end text-white text-left bg-[rgba(13,25,25,0.2)] backdrop-blur-xs border border-[#2D3838]/60 shadow-md"
              : "self-start bg-transparent text-white text-left"
          }`}
        >
           {sender === "bot" ? (
            <ResponseFormat content={text} />
          ) : (
            <div>{text}</div> )}
        </div>
      ))}
    </div>
  );
}
