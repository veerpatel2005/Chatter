import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { ChatProvider } from "../hooks/useChat";   // ✅ import provider

export default function ChatPage() {
  return (
    <ChatProvider>   {/* ✅ wrap your chat components */}
      <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gradient-to-br from-[#0b1020] to-[#141a3f] text-white">
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
