import { motion } from "framer-motion";

export default function NavItem({
  text,
  isExpanded,
  toggleNavbar,
  isActive = false, // Add isActive prop with default false
}: {
  text: string;
  isExpanded: boolean;
  toggleNavbar: () => void;
  isActive?: boolean;
}) {
  const handleClick = () => {
    // If you want the sidebar to collapse on mobile when clicking a nav item
    // toggleNavbar();
  };

  return (
    <div
      className={`group mb-1 flex cursor-pointer items-center rounded-md p-3 transition-colors duration-200 hover:bg-[#262F2F] ${
        isActive ? "bg-[#2D3838]" : "" // Apply active styling
      }`}
      onClick={handleClick}
    >
      <motion.div className="flex overflow-hidden">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white pl-1"
          >
            {text}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
