import { motion } from "framer-motion";
import NavItem from "./NavItem";
import NewChatButton from "./NewChatButton";
import SearchBar from "./SearchBar";
import ProfileFooter from "./ProfileFooter";

export default function Sidebar({
  isNavExpanded,
  smoothSidebarWidth,
  toggleNavbar,
}: {
  isNavExpanded: boolean;
  smoothSidebarWidth: any;
  toggleNavbar: () => void;
}) {
  return (
    <motion.div
      className="fixed top-0 left-0 h-screen bg-[#162020] flex flex-col justify-between z-20"
      style={{ width: smoothSidebarWidth }}
    >
      <div>
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

        <div className="px-4 mb-4">
          <NewChatButton isNavExpanded={isNavExpanded}  clickMe={()=>{console.log("Hi")}}/>
        </div>

        <div className="px-4 mb-6">
          <SearchBar isNavExpanded={isNavExpanded} />
        </div>

        <div className="px-2">
          {["Stock Market Ideas", "Profile", "Settings", "Help"].map((item) => (
            <NavItem
              key={item}
              text={item}
              isExpanded={isNavExpanded}
              toggleNavbar={toggleNavbar}
            />
          ))}
        </div>
      </div>

      <ProfileFooter isNavExpanded={isNavExpanded} />
    </motion.div>
  );
}
