"use client";

import {
  useState,
  useRef,
  useEffect,
  createContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";
import { SessionProvider, useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import Sidebar from "./_components/Sidebar";
import ChatContainer from "./_components/ChatContainer";
import ChatResizeHandle from "./_components/ChatResizeHandle";
import {
  OptionProvider,
  useOption,
} from "./_components/context/OptionsContext";
import { options } from "./_components/Options";
import ThemeToggleButton from "./_components/ThemeToggleButton";
import {
  ButtonProvider,
  useButtonContext,
} from "./_components/context/ButtonContext";

// Define the message type
export interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

// Define the conversation type
export interface Conversation {
  id: string;
  title: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  model?: string;
  // Add other fields as needed
}

// Create a context for messages and conversations
export interface MessagesContextType {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  currentConversationId: string | null;
  setCurrentConversationId: Dispatch<SetStateAction<string | null>>;
  storedConversations: Conversation[];
  setStoredConversations: Dispatch<SetStateAction<Conversation[]>>;
}

export const MessagesContext = createContext<MessagesContextType>({
  messages: [],
  setMessages: () => {},
  currentConversationId: null,
  setCurrentConversationId: () => {},
  storedConversations: [],
  setStoredConversations: () => {},
});

export default function Home() {
  return (
    <SessionProvider>
      <OptionProvider>
        <ButtonProvider>
          <ChatPage />
        </ButtonProvider>
      </OptionProvider>
    </SessionProvider>
  );
}

function ChatPage() {
  const [navWidth, setNavWidth] = useState(240);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [storedConversations, setStoredConversations] = useState<
    Conversation[]
  >([]);
  const{ active } = useButtonContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSidebarWidth, setMaxSidebarWidth] = useState(0);

  const MIN_NAV_WIDTH = 240;
  const MIN_CHAT_WIDTH = 400;
  const MAX_NAV_WIDTH = 850;

  const sidebarMotion = useMotionValue(navWidth);
  const smoothSidebarWidth = useSpring(sidebarMotion, {
    damping: 25,
    stiffness: 200,
  });

  const { data: session } = useSession();

  // Refs to keep latest state in closures
  const messagesRef = useRef(messages);
  const currentConversationIdRef = useRef(currentConversationId);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // Message ID generator (incremental)
  const messageIdCounter = useRef(Date.now());
  const getNextMessageId = () => {
    messageIdCounter.current += 1;
    return messageIdCounter.current;
  };

  useEffect(() => {
    sidebarMotion.set(navWidth);
  }, [navWidth, sidebarMotion]);

  useEffect(() => {
    const updateMaxSidebar = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setMaxSidebarWidth(
          Math.min(containerWidth - MIN_CHAT_WIDTH, MAX_NAV_WIDTH),
        );
      }
    };
    updateMaxSidebar();
    window.addEventListener("resize", updateMaxSidebar);
    return () => window.removeEventListener("resize", updateMaxSidebar);
  }, []);

  // Apply theme to the document root
  useEffect(() => {
    // Remove both classes first to ensure clean state
    document.documentElement.classList.remove("light", "dark");
    // Add the current theme class
    document.documentElement.classList.add(theme);

    // You can also store the preference in localStorage for persistence
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleNavbar = () => {
    if (!showNavbar) {
      setShowNavbar(true);
      setIsNavExpanded(true);
    } else if (isNavExpanded) {
      setShowNavbar(false);
    } else {
      setIsNavExpanded(true);
    }
  };

  // Create a new chat
  const createChatMutation = api.chat.createChat.useMutation({
    onSuccess: (data) => {
      console.log("Chat created successfully:", data?.fullMessage);

      // Store the new conversation ID if available
      if (data?.conversation) {
        setCurrentConversationId(data.conversation.id);

        // Add the new conversation to stored conversations
        setStoredConversations((prev) => {
          // Check if conversation already exists to prevent duplicates
          const exists = prev.some((conv) => conv.id === data.conversation.id);
          if (!exists) {
            return [data.conversation, ...prev];
          }
          return prev;
        });
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: getNextMessageId(),
            text: `${data?.fullMessage}`,
            sender: "bot",
          },
        ]);
      }, 1000);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });

  // Follow up on an existing chat
  const followUpChatMutation = api.chat.followUpChat.useMutation({
    onSuccess: (data) => {
      console.log("Follow-up chat successful:", data?.fullMessage);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: getNextMessageId(),
            text: `${data?.fullMessage}`,
            sender: "bot",
          },
        ]);
      }, 1000);
    },
    onError: (error) => {
      console.error("Error following up on chat:", error);
    },
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const { selectedOption } = useOption();
  const matchedOption = options.find(
    (opt) => opt.model === selectedOption || opt.label === selectedOption,
  );

  const addUserMessage = (text: string) => {
    const currentMessages = messagesRef.current;
    const currentConvId = currentConversationIdRef.current;

    const modelName =
      matchedOption?.model ?? "deepseek/deepseek-r1-0528-qwen3-8b:free";
    const labelName = selectedOption ?? "DeepSeek";

    if (currentMessages.length === 0 || !currentConvId) {
      createChatMutation.mutate({
        message: text,
        model: modelName,
        label: labelName,
        webSearch: active,
      });
    } else {
      followUpChatMutation.mutate({
        conversationId: currentConvId,
        message: text,
        model: modelName,
        label: labelName,
        webSearch: active,
      });
    }

    const userMessage = {
      id: getNextMessageId(),
      text,
      sender: "user" as const,
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  // Access the button state from context if needed
  const { active: buttonActive } = useButtonContext();

  // Use buttonActive in your component logic if needed
  useEffect(() => {
    if (buttonActive) {
      console.log("Button is active!");
      // Do something when the button is active
    }
  }, [buttonActive]);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        setMessages,
        currentConversationId,
        setCurrentConversationId,
        storedConversations,
        setStoredConversations,
      }}
    >
      <div
        className={`relative h-screen w-screen bg-[#f5f5f5] dark:bg-[#162020]`}
        ref={containerRef}
      >
        <button
          onClick={toggleNavbar}
          className={`fixed top-6 left-6 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-1.5 text-[#A2BEBE] shadow-lg transition-colors duration-200 ${
            showNavbar && isNavExpanded
              ? "border border-transparent bg-[#162020] hover:bg-[#2D3838]"
              : "border border-[#2D3838] bg-[#0D1919] hover:bg-[#0E2626]"
          } `}
          title={showNavbar ? "Collapse Sidebar" : "Open Sidebar"}
          style={{ outline: "none" }}
        >
          {showNavbar && isNavExpanded ? <FaChevronLeft /> : <FiMenu />}
        </button>

        {showNavbar && (
          <Sidebar
            isNavExpanded={isNavExpanded}
            smoothSidebarWidth={smoothSidebarWidth}
            toggleNavbar={toggleNavbar}
          />
        )}

        {showNavbar && (
          <ChatResizeHandle
            navWidth={navWidth}
            setNavWidth={setNavWidth}
            sidebarMotion={sidebarMotion}
            maxSidebarWidth={maxSidebarWidth}
            minNavWidth={MIN_NAV_WIDTH}
          />
        )}

        <ChatContainer
          messages={messages}
          addUserMessage={addUserMessage}
          toggleTheme={toggleTheme}
          theme={theme}
          showNavbar={showNavbar}
          smoothSidebarWidth={smoothSidebarWidth}
        />

        <ThemeToggleButton toggleTheme={toggleTheme} theme={theme} />
      </div>
    </MessagesContext.Provider>
  );
}
