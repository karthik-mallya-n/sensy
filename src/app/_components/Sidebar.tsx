import { motion } from "framer-motion";
import NavItem from "./NavItem";
import NewChatButton from "./NewChatButton";
import SearchBar from "./SearchBar";
import ProfileFooter from "./ProfileFooter";
import { useSession } from "next-auth/react";
import { useEffect, useContext } from "react";
import { api } from "~/trpc/react";
import { X } from "lucide-react";
import { MessagesContext } from "../page";

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
  
  // Access the shared context
  const { 
    messages, 
    setMessages, 
    currentConversationId, 
    setCurrentConversationId,
    storedConversations,
    setStoredConversations
  } = useContext(MessagesContext);

  // Fetch conversations query
  const { data: conversations, refetch } = api.chat.getChats.useQuery(
    { userId: session?.user.id || "" },
    {
      enabled: !!session?.user.id,
    }
  );

  // Query to get messages for selected conversation
  const getMessagesQuery = api.chat.getMessagesForChat.useQuery(
    { conversationId: currentConversationId || "" },
    { 
      enabled: !!currentConversationId,
      onSuccess: (data) => {
        console.log("Fetched messages for conversation:", data);
      }
    }
  );

  // Delete chat mutation
  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (_, variables) => {
      // If the deleted conversation was selected, clear the selection
      if (variables.conversationId === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      
      // Update stored conversations immediately
      setStoredConversations((prev) => 
        prev.filter((chat) => chat.id !== variables.conversationId)
      );
      
      // Refetch to ensure consistency
      refetch();
    },
  });

  // Handle delete chat
  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteChatMutation.mutate({ conversationId: chatId });
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  useEffect(() => {
    if (session?.user.id) {
      refetch();
    }
  }, [session?.user.id, refetch]);

  useEffect(() => {
    if (conversations) {
      console.log("Fetched conversations:", conversations);
      setStoredConversations(conversations);
    }
  }, [conversations, setStoredConversations]);

  // Effect to update messages when selected conversation changes
  useEffect(() => {
    if (currentConversationId && getMessagesQuery.data) {
      // Transform the messages from the API format to the format expected by the UI
      const formattedMessages = getMessagesQuery.data
        .map((messageResponsePair, index) => {
          // Each pair has userMessage and assistantMessage
          return [
            {
              id: index * 2,
              text: messageResponsePair.userMessage.content,
              sender: "user" as const,
            },
            {
              id: index * 2 + 1,
              text:
                messageResponsePair.assistantMessage?.content || "No response",
              sender: "bot" as const,
            },
          ];
        })
        .flat();

      // Update the messages in the context
      setMessages(formattedMessages);
    }
  }, [currentConversationId, getMessagesQuery.data, setMessages]);

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
              setCurrentConversationId(null);
              setMessages([]);
            }}
          />
        </div>

        <div className="mb-6 px-4">
          <SearchBar isNavExpanded={isNavExpanded} />
        </div>

        {/* Scrollable chats container */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-2">
          {storedConversations.map((chat) => (
            <div
              key={chat.id}
              className="group relative"
              onClick={() => handleSelectConversation(chat.id)}
            >
              <NavItem
                text={chat.title || "Chat"}
                isExpanded={isNavExpanded}
                toggleNavbar={toggleNavbar}
                isActive={currentConversationId === chat.id}
              />
              {isNavExpanded ? (
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-700 hover:text-red-500"
                  aria-label="Delete chat"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-700 hover:text-red-500"
                  aria-label="Delete chat"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Loading or empty state */}
          {storedConversations.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              {getMessagesQuery.isLoading
                ? "Loading conversations..."
                : "No conversations yet"}
            </div>
          )}
        </div>
      </div>

      <ProfileFooter isNavExpanded={isNavExpanded} />
    </motion.div>
  );
}
