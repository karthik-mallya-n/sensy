import { motion } from "framer-motion";
import NavItem from "./NavItem";
import NewChatButton from "./NewChatButton";
import SearchBar from "./SearchBar";
import ProfileFooter from "./ProfileFooter";
import { useSession } from "next-auth/react";
import { useEffect, useContext, useState } from "react";
import { api } from "~/trpc/react";
import { MessagesContext } from "../page";
import { FaTrash, FaPen } from "react-icons/fa";

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

  const {
    messages,
    setMessages,
    currentConversationId,
    setCurrentConversationId,
    storedConversations,
    setStoredConversations,
  } = useContext(MessagesContext);

  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const { data: conversations, refetch } = api.chat.getChats.useQuery(
    { userId: session?.user.id || "" },
    {
      enabled: !!session?.user.id,
    }
  );

  const getMessagesQuery = api.chat.getMessagesForChat.useQuery(
    { conversationId: currentConversationId || "" },
    {
      enabled: !!currentConversationId,
      onSuccess: (data) => {
        console.log("Fetched messages for conversation:", data);
      },
    }
  );

  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (_, variables) => {
      if (variables.conversationId === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      setStoredConversations((prev) =>
        prev.filter((chat) => chat.id !== variables.conversationId)
      );
      refetch();
    },
  });

  const renameChatMutation = api.chat.renameChat.useMutation({
    onSuccess: (updatedChat) => {
      setStoredConversations((prev) =>
        prev.map((chat) =>
          chat.id === updatedChat.id
            ? { ...chat, title: updatedChat.title }
            : chat
        )
      );
    },
  });

  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteChatMutation.mutate({ conversationId: chatId });
  };

  const handleRenameSubmit = (chatId: string) => {
    if (editedTitle.trim()) {
      renameChatMutation.mutate({
        conversationId: chatId,
        newTitle: editedTitle.trim(),
      });
    }
    setRenamingChatId(null);
    setEditedTitle("");
  };

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

  useEffect(() => {
    if (currentConversationId && getMessagesQuery.data) {
      const formattedMessages = getMessagesQuery.data
        .map((messageResponsePair, index) => [
          {
            id: index * 2,
            text: messageResponsePair.userMessage.content,
            sender: "user" as const,
          },
          {
            id: index * 2 + 1,
            text: messageResponsePair.assistantMessage?.content || "No response",
            sender: "bot" as const,
          },
        ])
        .flat();
      setMessages(formattedMessages);
    }
  }, [currentConversationId, getMessagesQuery.data, setMessages]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-20 flex h-screen flex-col justify-between bg-[#162020]"
      style={{ width: smoothSidebarWidth }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center p-4 pt-5.5 pb-8 pl-20">
          {isNavExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden text-2xl font-bold text-ellipsis whitespace-nowrap text-white mb-2"
            >
              sensy.ai
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

        <div className="custom-scrollbar flex-1 overflow-y-auto px-2">
          {storedConversations.map((chat) => (
            <div
              key={chat.id}
              className="group relative"
              onClick={() => handleSelectConversation(chat.id)}
            >
              {renamingChatId === chat.id ? (
<div
  className={`flex items-center px-4 py-3.5 rounded cursor-pointer text-white bg-[#2D3838] ${
    currentConversationId === chat.id ? "bg-[#334040]" : ""
  }`}
>
  <input
    className="flex-1 bg-transparent text-sm text-white outline-none"
    value={editedTitle}
    autoFocus
    onChange={(e) => setEditedTitle(e.target.value)}
    onBlur={() => handleRenameSubmit(chat.id)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleRenameSubmit(chat.id);
      }
    }}
  />
</div>

              ) : (
                <NavItem
                  text={chat.title || "Chat"}
                  isExpanded={isNavExpanded}
                  toggleNavbar={toggleNavbar}
                  isActive={currentConversationId === chat.id}
                />
              )}

              {/* Rename button */}
              {isNavExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingChatId(chat.id);
                    setEditedTitle(chat.title || "");
                  }}
                  className="cursor-pointer absolute top-1/2 right-8 -translate-y-1/2 rounded-full p-3 text-[#4A6262] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#78ACAC]"
                  aria-label="Rename chat"
                >
                  <FaPen size={16} />
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className={`absolute top-1/2 ${isNavExpanded ? "right-3" : "right-0"} cursor-pointer -translate-y-1/2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500`}
                aria-label="Delete chat"
              >
                <FaTrash size={isNavExpanded ? 16 : 12} />
              </button>
            </div>
          ))}

          {storedConversations.length === 0 && (
            <div className="mt-2 text-center text-gray-400">
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
