import { useState } from 'react'
import { useChat } from '../hooks/useChat'


export default function Composer({ disabled }){
const { sendMessage } = useChat()
const [text, setText] = useState('')


const onSend = async () => {
if(!text.trim()) return
await sendMessage(text.trim())
setText('')
}


const onKeyDown = (e)=>{
if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); onSend() }
}


return (
<div className="grid grid-cols-[1fr_auto] gap-2 p-3">
<textarea
disabled={disabled}
value={text}
onChange={e=>setText(e.target.value)}
onKeyDown={onKeyDown}
placeholder={disabled ? 'Select a chat to start messaging…' : 'Type a message…'}
className="h-[56px] resize-none px-3 py-2 rounded-xl bg-black/30 border border-white/20 outline-none"
/>
<button disabled={disabled} onClick={onSend} className="px-4 rounded-xl bg-[var(--accent)] disabled:opacity-50">Send</button>
</div>
)
}