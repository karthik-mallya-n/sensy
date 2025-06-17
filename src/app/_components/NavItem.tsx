import { motion } from "framer-motion";

export default function NavItem({
  text,
  isExpanded,
  toggleNavbar,
}: {
  text: string;
  isExpanded: boolean;
  toggleNavbar: () => void;
}) {
  return (
    <div
      className="flex items-center p-4 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors mb-2"
      onClick={toggleNavbar}
    >
      <div className="text-xl text-white" />
      {isExpanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 text-white">
          {text}
        </motion.div>
      )}
    </div>
  );
}
