"use client";

import { useRef, useState, useEffect } from "react";
import { FiSearch, FiPaperclip, FiSend } from "react-icons/fi";
import ModelSelector from "./ModelSelector";
import { FancyButton } from "./FancyButton";

interface ChatInputBoxProps {
  onSend: (message: string) => void;
}

export default function ChatInputBox({ onSend }: ChatInputBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const MIN_CHATBOX_HEIGHT = 140;
  const BOTTOM_ROW_HEIGHT = 64;

  const [chatboxHeight, setChatboxHeight] = useState(MIN_CHATBOX_HEIGHT);
  const [inputValue, setInputValue] = useState("");
  const [boxWidth, setBoxWidth] = useState("calc(100% - 5rem)");

  // Listen for chat container width changes
  useEffect(() => {
    const chatContainer = document.querySelector('.chat');
    if (!chatContainer) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = chatContainer.getBoundingClientRect().width;
      // Set width to be slightly smaller than the container
      const newWidth = Math.min(containerWidth - 32, 900); // 32px margin (16px on each side)
      setBoxWidth(`${newWidth}px`);
    });

    observer.observe(chatContainer);
    return () => observer.disconnect();
  }, []);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // max 200px
      textareaRef.current.style.height = `${newHeight}px`;

      // Ensure total height doesn't shrink below minimum
      const totalHeight = Math.max(newHeight + BOTTOM_ROW_HEIGHT, MIN_CHATBOX_HEIGHT);
      setChatboxHeight(totalHeight);
    }
  };

  const handleSend = () => {
    const message = inputValue.trim();
    if (!message) return;

    onSend(message);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setChatboxHeight(MIN_CHATBOX_HEIGHT);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      ref={boxRef}
      className="chatbox sticky bottom-7 mb-2 mx-auto bg-[#0D1919] border-[8px] border-[#1F2626]/50 rounded-2xl"
      style={{
        boxShadow: "0 4px 50px rgba(0,0,0,0.5)",
        width: boxWidth,
        maxWidth: "900px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: "1px",
        paddingBottom: "12px",
        paddingLeft: "16px",
        paddingRight: "16px",
        rowGap: "12px",
        transition: "height 0.2s ease, width 0.3s ease",
        height: `${chatboxHeight}px`,
        overflow: "hidden",
        backgroundImage: `url('/noise.png')`,
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        zIndex: 50
      }}
    >
      {/* Textarea wrapper */}
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <textarea
          ref={textareaRef}
          placeholder="Type your message..."
          className="resize-none bg-transparent text-[#A2BEBE] placeholder-[#A2BEBE] outline-none w-full scrollbar-thin scrollbar-thumb-[#47585e] scrollbar-track-[#1f2626]"
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px 0",
            resize: "none",
            overflowY: "auto",
            maxHeight: "140px",
            minHeight: "56px",
            lineHeight: "1.4rem",
            fontSize: "14px",
          }}
          onInput={handleInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Fixed Buttons Row */}
      <div className="flex justify-between items-center flex-shrink-0">
        {/* Left buttons */}
        <div className="flex gap-2 items-center">
          {/* Model selector */}
          <div className="relative">
            <ModelSelector />
          </div>

          {/* Search button */}
          <FancyButton />

          {/* Attachment button */}
          <button
            type="button"
            className="p-1.5 bg-[#066262] text-[#A2BEBE] hover:text-[#0D1919] cursor-pointer rounded-md hover:bg-[#0DC5C5] active:scale-95 transition-transform duration-150 ease-in-out flex items-center justify-center"
            style={{ width: "32px", height: "32px" }}
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          className="p-1.5 cursor-pointer rounded-md text-[#A2BEBE] hover:text-[#0D1919] bg-[#066262] hover:bg-[#0DC5C5] active:scale-95 transition-transform duration-150 ease-in-out flex items-center justify-center"
          style={{ width: "32px", height: "32px" }}
          aria-label="Send message"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
