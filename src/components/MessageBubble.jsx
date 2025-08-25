export default function MessageBubble({ isMe, text }){
return (
<div className={`max-w-[70%] px-3 py-2 rounded-2xl leading-snug ${isMe ? 'self-end bg-gradient-to-br from-[var(--accent)] to-[#8e99ff]' : 'self-start bg-white/10'}`}>
{text}
</div>
)
}