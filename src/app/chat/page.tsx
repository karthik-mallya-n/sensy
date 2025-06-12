"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiMessageSquare, FiSettings, FiUser, FiHelpCircle } from 'react-icons/fi';
import { FaChevronLeft } from 'react-icons/fa';

const NavItem = ({ icon, text, isExpanded, toggleNavbar }: { 
  icon: React.ReactNode; 
  text: string; 
  isExpanded: boolean;
  toggleNavbar: () => void;
}) => {
  return (
    <div 
      className="flex items-center p-4 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors mb-2" 
      onClick={toggleNavbar}
    >
      <div className="text-xl text-white">{icon}</div>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ml-4 text-white"
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

export default function ChatPage() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [navWidth, setNavWidth] = useState(240); // Default expanded width
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // Set maximum width to half the screen
      setMaxWidth(containerRef.current.offsetWidth / 2);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setMaxWidth(containerRef.current.offsetWidth / 2);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNavbar = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  return (
    <div className="flex h-screen bg-gray-100" ref={containerRef}>
      {/* Vertical Navbar */}
      <motion.div 
        className="bg-gray-800 h-full flex flex-col relative"
        initial={{ width: "60px" }}
        animate={{ width: isNavExpanded ? `${navWidth}px` : "60px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 flex justify-between items-center">
          {isNavExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white font-bold text-xl overflow-hidden text-ellipsis whitespace-nowrap"
            >
              Sensy
            </motion.div>
          )}
          <button onClick={toggleNavbar} className="text-white p-1">
            {isNavExpanded ? <FaChevronLeft /> : <FiMenu />}
          </button>
        </div>
        
        <div className="mt-8">
          <NavItem icon={<FiMessageSquare />} text="Chat" isExpanded={isNavExpanded} toggleNavbar={toggleNavbar} />
          <NavItem icon={<FiUser />} text="Profile" isExpanded={isNavExpanded} toggleNavbar={toggleNavbar} />
          <NavItem icon={<FiSettings />} text="Settings" isExpanded={isNavExpanded} toggleNavbar={toggleNavbar} />
          <NavItem icon={<FiHelpCircle />} text="Help" isExpanded={isNavExpanded} toggleNavbar={toggleNavbar} />
        </div>
        
        {/* Drag handle with smoother animation */}
        {isNavExpanded && (
          <div 
            className="absolute top-0 right-0 w-3 h-full cursor-ew-resize hover:bg-gray-600/30"
            onMouseDown={(e) => {
              e.preventDefault();
              
              const startX = e.clientX;
              const startWidth = navWidth;
              let animationFrameId: number;
              let currentClientX = startX;
              
              const updateWidth = () => {
                const delta = currentClientX - startX;
                const newWidth = Math.max(240, Math.min(maxWidth, startWidth + delta));
                setNavWidth(newWidth);
                animationFrameId = requestAnimationFrame(updateWidth);
              };
              
              const handleMouseMove = (e: MouseEvent) => {
                currentClientX = e.clientX;
                if (!animationFrameId) {
                  animationFrameId = requestAnimationFrame(updateWidth);
                }
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (animationFrameId) {
                  cancelAnimationFrame(animationFrameId);
                }
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
              
              // Start the animation
              animationFrameId = requestAnimationFrame(updateWidth);
            }}
          />
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Hello Re!</p>
        </div>
      </div>
    </div>
  );
}
