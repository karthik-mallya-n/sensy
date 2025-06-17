"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TestTRPC() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id || "";

  // State for inputs
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [label, setLabel] = useState("DeepSeek");
  const [conversationId, setConversationId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [newUserMessage, setNewUserMessage] = useState("");
  
  // State for displaying results
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("create");

  // Queries and mutations
  const getChatsQuery = api.chat.getChats.useQuery({ userId }, { enabled: false });
  const getMessagesQuery = api.chat.getMessagesForChat.useQuery(
    { conversationId }, 
    { enabled: !!conversationId }
  );
  
  const createChatMutation = api.chat.createChat.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
  });
  
  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (data) => {
      setResult(data);
      getChatsQuery.refetch();
    },
  });
  
  const updateUserMessageMutation = api.chat.updateUserMessage.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
  });

  // Handler functions
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setResult({ error: "User not authenticated" });
      return;
    }
    
    createChatMutation.mutate({
      userId,
      message,
      model,
      label,
      conversationId: conversationId || undefined,
    });
  };

  const handleGetChats = async () => {
    if (!userId) {
      setResult({ error: "User not authenticated" });
      return;
    }
    
    const data = await getChatsQuery.refetch();
    setResult(data.data);
  };

  const handleGetMessages = async () => {
    if (!conversationId) {
      setResult({ error: "Conversation ID is required" });
      return;
    }
    
    const data = await getMessagesQuery.refetch();
    setResult(data.data);
  };

  const handleDeleteChat = async () => {
    if (!conversationId) {
      setResult({ error: "Conversation ID is required" });
      return;
    }
    
    deleteChatMutation.mutate({ conversationId });
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageId || !newUserMessage) {
      setResult({ error: "Message ID and new content are required" });
      return;
    }
    
    updateUserMessageMutation.mutate({
      messageId,
      label,
      model,
      newUserMessage,
    });
  };

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 shadow">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Authentication Required</h1>
          <p className="mb-4 text-red-600">You need to be signed in to use these protected procedures.</p>
          <button
            onClick={() => router.push("/api/auth/signin")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">TRPC Protected Procedures Test</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button 
            className={`px-3 py-2 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Chat
          </button>
          <button 
            className={`px-3 py-2 ${activeTab === 'get' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('get')}
          >
            Get Chats/Messages
          </button>
          <button 
            className={`px-3 py-2 ${activeTab === 'delete' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('delete')}
          >
            Delete Chat
          </button>
          <button 
            className={`px-3 py-2 ${activeTab === 'update' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('update')}
          >
            Update Message
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        {activeTab === 'create' && (
          <form onSubmit={handleCreateChat} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Create New Chat</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input 
                type="text" 
                value={userId}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input 
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <select 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="Nvidia">Nvidia</option>
                  <option value="GPT-4o-Mini">GPT-4o-Mini</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversation ID (Optional - for branching)
              </label>
              <input 
                type="text"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={createChatMutation.isPending}
            >
              {createChatMutation.isPending ? "Creating..." : "Create Chat"}
            </button>
          </form>
        )}
        
        {activeTab === 'get' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Get All Chats</h2>
              <button
                onClick={handleGetChats}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                disabled={getChatsQuery.isFetching}
              >
                {getChatsQuery.isFetching ? "Loading..." : "Get Chats"}
              </button>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Get Messages for Chat</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conversation ID</label>
                <input 
                  type="text"
                  value={conversationId}
                  onChange={(e) => setConversationId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                onClick={handleGetMessages}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                disabled={getMessagesQuery.isFetching || !conversationId}
              >
                {getMessagesQuery.isFetching ? "Loading..." : "Get Messages"}
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'delete' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Delete Chat</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Conversation ID</label>
              <input 
                type="text"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <button
              onClick={handleDeleteChat}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={deleteChatMutation.isPending || !conversationId}
            >
              {deleteChatMutation.isPending ? "Deleting..." : "Delete Chat"}
            </button>
          </div>
        )}
        
        {activeTab === 'update' && (
          <form onSubmit={handleUpdateMessage} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Update User Message</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message ID</label>
              <input 
                type="text"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Message Content</label>
              <textarea 
                value={newUserMessage}
                onChange={(e) => setNewUserMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input 
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <select 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="Nvidia">Nvidia</option>
                  <option value="GPT-4o-Mini">GPT-4o-Mini</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={updateUserMessageMutation.isPending}
            >
              {updateUserMessageMutation.isPending ? "Updating..." : "Update Message"}
            </button>
          </form>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}