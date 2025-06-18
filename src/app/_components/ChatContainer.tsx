"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import ChatArea from "~/app/_components/ChatArea";
import ChatInputBox from "~/app/_components/ChatInputBox";
import ThemeToggleButton from "./ThemeToggleButton";

interface ChatContainerProps {
  messages: {
    id: number;
    text: string;
    sender: "user" | "bot";
  }[];
  addUserMessage: (text: string) => void;
  toggleTheme: () => void;
  theme: "light" | "dark";
  showNavbar: boolean;
  smoothSidebarWidth: any;
}

export default function ChatContainer({
  messages,
  addUserMessage,
  toggleTheme,
  theme,
  showNavbar,
  smoothSidebarWidth,
}: ChatContainerProps) {
  const chatRef = useRef<HTMLDivElement>(null);

  // Update CSS variable for sidebar width to use in transform calculation
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      showNavbar ? `${smoothSidebarWidth}px` : "0px"
    );
  }, [showNavbar, smoothSidebarWidth]);

  return (
    <motion.div
      className="content h-full"
      style={{
        marginLeft: showNavbar ? smoothSidebarWidth : 0,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div
        className={`chatarea h-full pr-2.5 pt-2.5 pb-2.5 flex ${
          !showNavbar ? "pl-2.5" : ""
        }`}
      >
        <div
          ref={chatRef}
          className="chat flex-1 min-w-[400px] rounded-lg h-full overflow-auto relative border border-[#2D3838] flex flex-col"
style={{
  backgroundImage: `
    linear-gradient(
      90deg,
      rgba(13, 25, 25, 1) 0%,
      rgba(16, 32, 32, 1) 25%,
      rgba(21, 40, 40, 1) 50%,
      rgba(16, 32, 32, 1) 75%,
      rgba(13, 25, 25, 1) 100%
    ),
    linear-gradient(rgba(13, 25, 25, 0.2), rgba(13, 25, 25, 0.4)),
    url('/noise1.png')
  `,
  backgroundSize: "cover, cover, cover",
  backgroundBlendMode: "multiply, normal, multiply",
}}

        >
          <ThemeToggleButton toggleTheme={toggleTheme} theme={theme} />
          <div className="flex-grow overflow-y-auto">
            <ChatArea messages={messages} />
          </div>
          <div className="flex-shrink-0">
            <ChatInputBox onSend={addUserMessage} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
