"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiSettings,
  FiUser,
  FiHelpCircle,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";

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

  // Update max sidebar width on container resize
  useEffect(() => {
    if (containerRef.current) {
      setMaxSidebarWidth(containerRef.current.offsetWidth / 2);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setMaxSidebarWidth(containerRef.current.offsetWidth / 2);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleNavbar = () => {
    if (isNavExpanded) {
      setShowNavbar(false);
    } else {
      setIsNavExpanded(true);
      setShowNavbar(true);
    }
  };

  const MIN_NAV_WIDTH = 240;
const MIN_CHAT_WIDTH = 400;
const MAX_NAV_WIDTH = 850;

useEffect(() => {
  if (containerRef.current) {
    const containerWidth = containerRef.current.offsetWidth;
    const calculatedMaxWidth = containerWidth - MIN_CHAT_WIDTH - 32;
    setMaxSidebarWidth(Math.min(calculatedMaxWidth, MAX_NAV_WIDTH));
  }

  const handleResize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const calculatedMaxWidth = containerWidth - MIN_CHAT_WIDTH - 32;
      setMaxSidebarWidth(Math.min(calculatedMaxWidth, MAX_NAV_WIDTH));
    }
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  // Calculate chat width dynamically based on container width and navWidth
  const getChatWidth = () => {
    if (!containerRef.current) return 800;
    const containerWidth = containerRef.current.offsetWidth;
    const sidebarActualWidth = showNavbar ? (isNavExpanded ? navWidth : 60) : 0;
    const chatAvailableWidth = containerWidth - sidebarActualWidth - 32; // 32 for padding
    return chatAvailableWidth > 400 ? chatAvailableWidth : 400;
  };

  // Force update on navWidth changes to trigger re-render and adjust chat width
  const [chatWidth, setChatWidth] = useState(getChatWidth());

  useEffect(() => {
    setChatWidth(getChatWidth());
  }, [navWidth, showNavbar, isNavExpanded]);

  return (
    <div
      className="h-screen w-screen bg-[#162020] box-border relative"
      ref={containerRef}
    >
      {/* Sidebar */}
      {showNavbar && (
        <motion.div
          className="fixed top-0 left-0 h-screen bg-[#162020] flex flex-col justify-between z-10"
          initial={{ width: "60px" }}
          animate={{ width: isNavExpanded ? `${navWidth}px` : "60px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-center p-4">
              {isNavExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white font-bold text-xl overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <span className="text-cyan-400">🧠</span> Sensy
                </motion.div>
              )}
              <button onClick={toggleNavbar} className="text-white p-1">
                {isNavExpanded ? <FaChevronLeft /> : <FiMenu />}
              </button>
            </div>

            {/* New Chat Button */}
            <div className="px-4 mb-4">
              <button className="flex items-center w-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md">
                <FiPlus className="mr-2" />
                {isNavExpanded && <span>New Chat</span>}
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 mb-6">
              <div className="flex items-center bg-gray-700 text-white rounded-md px-3 py-2">
                <FiSearch />
                {isNavExpanded && (
                  <input
                    type="text"
                    placeholder="Search..."
                    className="ml-2 bg-transparent outline-none w-full placeholder-gray-300"
                    style={{ width: "100%" }} // Fill sidebar width
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
          <div className="p-4 border-t border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white text-lg">
              <FiUser />
            </div>
            {isNavExpanded && (
              <div className="text-white">
                <div className="font-semibold text-sm">User ID</div>
                <div className="text-gray-400 text-xs">user@sensy.ai</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Floating Open Sidebar Button */}
      {!showNavbar && (
        <button
          onClick={() => {
            setShowNavbar(true);
            setIsNavExpanded(true);
          }}
          className="fixed top-4 left-4 z-20 p-3 rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-700 transition"
          title="Open Sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
      )}

      {/* Main Content */}
      <div
        className="content h-full transition-all duration-300"
        style={{
          marginLeft: showNavbar
            ? isNavExpanded
              ? `${navWidth}px`
              : "60px"
            : "0px",
        }}
      >
        <div className="h-full p-4 flex justify-end">
          <div
            className="chat bg-[#0D1919] p-8 rounded-lg h-full overflow-auto relative"
            style={{
              width: `${chatWidth}px`,
              minWidth: "200px",
            }}
          >
            {/* Chat Resize Handle */}
<div
  className="absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-gray-600/30 z-10"
  onMouseDown={(e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startNavWidth = navWidth; // Starting sidebar width
    let animationFrameId: number;
    let currentClientX = startX;

    const updateWidth = () => {
      const delta = currentClientX - startX; // Dragging right increases sidebar width
      const newNavWidth = Math.min(
        Math.max(MIN_NAV_WIDTH, startNavWidth + delta), // enforce minimum width
        maxSidebarWidth // enforce maximum width
      );
      setNavWidth(newNavWidth);
      animationFrameId = requestAnimationFrame(updateWidth);
    };

    const handleMouseMove = (e: MouseEvent) => {
      currentClientX = e.clientX;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    animationFrameId = requestAnimationFrame(updateWidth);
  }}
/>


            {/* Your chat content goes here */}
          </div>
        </div>
      </div>
    </div>
  );
}
