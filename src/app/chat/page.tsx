"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  FiMenu,
  FiUser,
  FiSearch,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";
import ChatInputBox from "~/app/_components/ChatInputBox";
import ChatArea from "~/app/_components/ChatArea";

const NavItem = ({
  text,
  isExpanded,
  toggleNavbar,
}: {
  text: string;
  isExpanded: boolean;
  toggleNavbar: () => void;
}) => {
  return (
    <div
      className="flex items-center p-4 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors mb-2"
      onClick={toggleNavbar}
    >
      <div className="text-xl text-white" />
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-4 text-white"
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

export default function ChatPage() {
  const [navWidth, setNavWidth] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSidebarWidth, setMaxSidebarWidth] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const MIN_NAV_WIDTH = 240;
  const MIN_CHAT_WIDTH = 400;
  const MAX_NAV_WIDTH = 850;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatboxHeight, setChatboxHeight] = useState(140); // default height

  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
  const models = ["GPT-4-1 Mini", "GPT-4", "GPT-3.5", "GPT-Neo"];

  // This function updates the textarea height and chatbox height state
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // max 200px
      textareaRef.current.style.height = `${newHeight}px`;

      // Bottom row ~64px (margin + buttons)
      setChatboxHeight(newHeight + 64);
    }
  };

  // Sidebar animation (not related to chatbox but kept for your logic)
  const sidebarMotion = useMotionValue(navWidth);
  const smoothSidebarWidth = useSpring(sidebarMotion, {
    damping: 25,
    stiffness: 200,
  });

  useEffect(() => {
    sidebarMotion.set(navWidth);
  }, [navWidth, sidebarMotion]);

  useEffect(() => {
    const updateMaxSidebar = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedMaxWidth = containerWidth - MIN_CHAT_WIDTH;
        setMaxSidebarWidth(Math.min(calculatedMaxWidth, MAX_NAV_WIDTH));
      }
    };
    updateMaxSidebar();
    window.addEventListener("resize", updateMaxSidebar);
    return () => window.removeEventListener("resize", updateMaxSidebar);
  }, []);

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

  interface ChatMessage {
    id: number;
    text: string;
    sender: "user" | "bot";
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addUserMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response after 1s delay
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `Bot reply to: "${text}"`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className="h-screen w-screen bg-[#162020] relative"
      ref={containerRef}
    >
      {/* Fixed toggle button on top left */}
      <button
        onClick={toggleNavbar}
        className={`
    fixed top-6 left-6 z-30 p-1.5 w-8 h-8 rounded-md flex items-center justify-center text-white shadow-lg transition-colors duration-200
    ${showNavbar && isNavExpanded
            ? "bg-[#162020] hover:bg-[#2D3838] border border-transparent"
            : "bg-[#0D1919] hover:bg-[#0E2626] border border-[#2D3838]"
          }
  `}
        title={showNavbar ? "Collapse Sidebar" : "Open Sidebar"}
        style={{ outline: "none" }}
      >
        {showNavbar && isNavExpanded ? <FaChevronLeft /> : <FiMenu />}
      </button>


      {/* Sidebar */}
      {showNavbar && (
        <motion.div
          className="fixed top-0 left-0 h-screen bg-[#162020] flex flex-col justify-between z-20"
          style={{ width: smoothSidebarWidth }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center p-4 pl-20 pt-6.5 pb-8">
              {isNavExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-bold text-xl overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <span className="text-cyan-400">🧠</span> Sensy
                </motion.div>
              )}
            </div>

            {/* New Chat Button */}
            <div className="px-4 mb-4">
              <motion.button
                whileHover={{
                  scale: 0.99,
                  backgroundColor: "#0DC5C5",
                  backgroundImage: "none",
                }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="cursor-pointer flex justify-center items-center w-full h-10 text-sm text-white font-semibold rounded-lg py-2 px-3"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(7, 115, 115, 1) 0%, rgba(1, 82, 82, 1) 100%)",
                }}
              >
                {isNavExpanded && <span>New Chat</span>}
              </motion.button>
            </div>

            {/* Search Input */}
            <div className="px-4 mb-6">
              <div
                className="flex items-center bg-[#0D1919] text-[#7B9999] rounded-md px-3 py-2"
                style={{
                  boxShadow: "0 0 0 1px rgba(45, 56, 56, 1)",
                }}
              >
                <FiSearch />
                {isNavExpanded && (
                  <input
                    type="text"
                    placeholder="Search..."
                    className="ml-2 bg-transparent outline-none w-full placeholder-[#7B9999]"
                  />
                )}
              </div>
            </div>

            {/* Nav Items */}
            <div className="px-2">
              <NavItem
                text="Stock Market Ideas"
                isExpanded={isNavExpanded}
                toggleNavbar={toggleNavbar}
              />
              <NavItem
                text="Profile"
                isExpanded={isNavExpanded}
                toggleNavbar={toggleNavbar}
              />
              <NavItem
                text="Settings"
                isExpanded={isNavExpanded}
                toggleNavbar={toggleNavbar}
              />
              <NavItem
                text="Help"
                isExpanded={isNavExpanded}
                toggleNavbar={toggleNavbar}
              />
            </div>
          </div>

          {/* Profile Footer */}
          <div className="p-4 border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white text-lg">
              <FiUser />
            </div>
            {isNavExpanded && (
              <div className="text-white">
                <div className="font-semibold text-[#E3E3E6] text-sm">User ID</div>
                <div className="text-[#A2BEBE] text-xs">user@sensy.ai</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div

        className="content h-full"
        style={{
          marginLeft: showNavbar
            ? isNavExpanded
              ? smoothSidebarWidth
              : 60
            : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div
          className={`chatarea h-full pr-2.5 pt-2.5 pb-2.5 flex ${!showNavbar ? "pl-2.5" : ""
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
            <button
              onClick={toggleTheme}
              className="fixed bottom-6 right-6 z-30 p-1.5 w-8 h-8 bg-[#0D1919] dark:bg-cyan-600 rounded-md flex items-center justify-center text-white shadow-lg hover:bg-[#0E2626] dark:hover:bg-cyan-700 transition border border-[#2D3838]"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <FiSun className="text-[#A2BEBE] h-6 w-6" />
              ) : (
                <FiMoon className="text-[#A2BEBE] h-8 w-8" />
              )}
            </button>

            {/* Chat Resize Handle */}
            <div
              className="absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-transparent z-10"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startNavWidth = navWidth;

                const handleMouseMove = (e: MouseEvent) => {
                  const delta = e.clientX - startX;
                  const newWidth = Math.min(
                    Math.max(MIN_NAV_WIDTH, startNavWidth + delta),
                    maxSidebarWidth
                  );
                  sidebarMotion.set(newWidth); // Update width immediately
                };

                const handleMouseUp = (e: MouseEvent) => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);

                  const finalDelta = e.clientX - startX;
                  const finalWidth = Math.min(
                    Math.max(MIN_NAV_WIDTH, startNavWidth + finalDelta),
                    maxSidebarWidth
                  );
                  setNavWidth(finalWidth); // finalize state width on mouse up
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
            />


            {/* Chat messages */}
            <ChatArea messages={messages} />
            <ChatInputBox onSend={addUserMessage} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
