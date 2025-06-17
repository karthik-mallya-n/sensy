"use client";

import { motion } from "framer-motion";
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
          className="chat flex-1 min-w-[400px] rounded-lg h-full overflow-auto relative border border-[#2D3838]"
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
                url('/noise.png')
              `,
            backgroundSize: "cover",
            backgroundBlendMode: "multiply",
          }}
        >
          <ThemeToggleButton toggleTheme={toggleTheme} theme={theme} />
          <ChatArea messages={messages} />
          <ChatInputBox onSend={addUserMessage} />
        </div>
      </div>
    </motion.div>
  );
}
