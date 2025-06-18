import { motion } from "framer-motion";
import NavItem from "./NavItem";
import NewChatButton from "./NewChatButton";
import SearchBar from "./SearchBar";
import ProfileFooter from "./ProfileFooter";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { api } from "~/trpc/react";

export default function Sidebar({
  isNavExpanded,
  smoothSidebarWidth,
  toggleNavbar,
}: {
  isNavExpanded: boolean;
  smoothSidebarWidth: any;
  toggleNavbar: () => void;
}) {
  const { data: session } = useSession();

  const { data: conversations, refetch } = api.chat.getChats.useQuery(
    { userId: session?.user.id || "" },
    {
      enabled: !!session?.user.id, // prevent query from running until user ID is available
    },
  );

  useEffect(() => {
    if (session?.user.id) {
      refetch(); // Refetch whenever user ID changes (optional — because useQuery will handle initial fetch)
    }
  }, [session?.user.id, refetch]);

  useEffect(() => {
    if (conversations) {
      console.log("Fetched conversations:", conversations);
    }
  }, [conversations]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-20 flex h-screen flex-col justify-between bg-[#162020]"
      style={{ width: smoothSidebarWidth }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center p-4 pt-6.5 pb-8 pl-20">
          {isNavExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden text-xl font-bold text-ellipsis whitespace-nowrap text-white"
            >
              <span className="text-cyan-400">🧠</span> Sensy
            </motion.div>
          )}
        </div>

        <div className="mb-4 px-4">
          <NewChatButton
            isNavExpanded={isNavExpanded}
            clickMe={() => {
              console.log("Hi");
            }}
          />
        </div>

        <div className="mb-6 px-4">
          <SearchBar isNavExpanded={isNavExpanded} />
        </div>

        {/* Scrollable chats container */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-2">
          {conversations?.map((chat) => (
            <NavItem
              key={chat.id}
              text={chat.title || "Chat"}
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
