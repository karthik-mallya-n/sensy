"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";

import Sidebar from "../_components/Sidebar";
import ChatContainer from "../_components/ChatContainer";
import ChatResizeHandle from "../_components/ChatResizeHandle";

export default function ChatPage() {
  const [navWidth, setNavWidth] = useState(240);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [messages, setMessages] = useState<{ id: number; text: string; sender: "user" | "bot" }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSidebarWidth, setMaxSidebarWidth] = useState(0);

  const MIN_NAV_WIDTH = 240;
  const MIN_CHAT_WIDTH = 400;
  const MAX_NAV_WIDTH = 850;

  const sidebarMotion = useMotionValue(navWidth);
  const smoothSidebarWidth = useSpring(sidebarMotion, { damping: 25, stiffness: 200 });

  useEffect(() => {
    sidebarMotion.set(navWidth);
  }, [navWidth, sidebarMotion]);

  useEffect(() => {
    const updateMaxSidebar = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setMaxSidebarWidth(Math.min(containerWidth - MIN_CHAT_WIDTH, MAX_NAV_WIDTH));
      }
    };
    updateMaxSidebar();
    window.addEventListener("resize", updateMaxSidebar);
    return () => window.removeEventListener("resize", updateMaxSidebar);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const addUserMessage = (text: string) => {
    const userMessage = { id: Date.now(), text, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: `Bot reply to: "${text}"`, sender: "bot" }]);
    }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-[#162020] relative" ref={containerRef}>
      <button
        onClick={toggleNavbar}
        className={`fixed top-6 left-6 z-30 p-1.5 w-8 h-8 rounded-md flex items-center justify-center text-white shadow-lg transition-colors duration-200
          ${
            showNavbar && isNavExpanded
              ? "bg-[#162020] hover:bg-[#2D3838] border border-transparent"
              : "bg-[#0D1919] hover:bg-[#0E2626] border border-[#2D3838]"
          }
        `}
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
    </div>
  );
}
