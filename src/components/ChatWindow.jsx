import { useChat } from '../hooks/useChat'
import MessageBubble from './MessageBubble'
import Composer from './Composer'


export default function ChatWindow(){
const { active, messages } = useChat()


return (
<main className="flex flex-col min-h-screen w-full">
{/* Topbar */}
<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121735]/60 backdrop-blur-md">
<div className="flex items-center gap-3">
<div className="md:hidden"><MobileSidebarToggle/></div>
<div>
<div className="font-bold">{active?.otherName || 'Welcome'}</div>
<div className="text-sm text-[#a8b0d6]">{active ? 'Say hello 👋' : 'Select a conversation or find people to start chatting.'}</div>
</div>
</div>
</div>


{/* Content */}
<div className="grid grid-rows-[1fr_auto] h-[calc(100vh-56px)]">
<div id="messages" className="p-4 overflow-auto flex flex-col gap-2">
{!active && (
<div className="grid place-items-center h-full text-[#aeb7e9]">
<div className="px-3 py-1 rounded-full border border-dashed border-white/20 bg-white/10">No chat selected</div>
</div>
)}


{active && messages.map((m)=> (
<MessageBubble key={m.id} isMe={m.isMe} text={m.text} />
))}
<div className="h-1" />
</div>
<div className="border-t border-white/10 bg-black/20">
<Composer disabled={!active} />
</div>
</div>
</main>
)
}


function MobileSidebarToggle(){
// This is a placeholder; you can wire it to a drawer if you add one later
return <button className="px-3 py-2 rounded-xl border border-white/20 bg-white/10">☰</button>
}