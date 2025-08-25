import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../hooks/useChat'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'


export default function Sidebar() {
    const { user, logout } = useAuth()
    const { recentChats, openChatById, startChatWith } = useChat()
    const [term, setTerm] = useState('')
    const [people, setPeople] = useState([])


    useEffect(() => {
        let active = true; (async () => {
            const qs = await getDocs(collection(db, 'users'))
            const items = qs.docs.map(d => d.data()).filter(u => u.uid !== user?.uid)
            if (!active) return
            setPeople(items)
            console.log(items);
            
        })(); return () => { active = false }
    }, [user])


    const filtered = useMemo(() => {
        const t = term.trim().toLowerCase()
        if (!t) return people.slice(0, 50)
        return people.filter(u => (u.name || '').toLowerCase().includes(t) || (u.email || '').toLowerCase().includes(t))
    }, [term, people])


    return (
        <aside className="hidden md:flex md:flex-col gap-4 p-4 border-r border-white/10 bg-[#121735]/70 backdrop-blur-md min-h-screen w-[280px]">
            <div className="flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-2)] shadow-[0_0_18px_#16db65]"></span>
                <span>Chatter</span>
            </div>


            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                <img className="w-9 h-9 rounded-full" src={user?.photoURL || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(user?.uid || 'me')}`} />
                <div className="truncate">
                    <div className="font-semibold truncate">{user?.displayName || '—'}</div>
                    <div className="text-sm text-[#a8b0d6] truncate">{user?.email}</div>
                </div>
            </div>


            <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                <div className="flex gap-2">
                    <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search users by name/email" className="flex-1 bg-black/30 border border-white/20 rounded-xl px-3 py-2 outline-none" />
                    <a href={`mailto:?subject=Join%20me%20on%20Chatter&body=Let%E2%80%99s%20chat%20here:%20${location.href}`} className="px-3 py-2 rounded-xl border border-white/20 bg-white/10">+</a>
                </div>
                {/* Quick people list */}
                {term && (
                    <div className="mt-3 max-h-56 overflow-auto flex flex-col gap-2">
                        {filtered.length === 0 && <div className="text-sm text-[#a8b0d6]">No users found.</div>}
                        {filtered.map(u => (
                            <div key={u.uid} className="grid grid-cols-[46px_1fr_auto] gap-2 p-2 rounded-xl hover:bg-white/10">
                                <img className="w-11 h-11 rounded-full" src={u.photoURL || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u.name || u.uid)}`} />
                                <div className="truncate">
                                    <div className="font-semibold truncate">{u.name || 'User'}</div>
                                    <div className="text-sm text-[#b7bde3] truncate">{u.email || ''}</div>
                                </div>
                                <button onClick={() => startChatWith(u.uid)} className="px-3 py-2 rounded-xl border border-white/20 bg-white/10">Chat</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            <div className="bg-white/5 rounded-2xl border border-white/10 p-2 flex-1 min-h-0">
                <div className="text-[#a8b0d6] px-2 pb-2">Recent chats</div>
                <div className="flex flex-col gap-1 overflow-auto max-h-full">
                    {recentChats.map(c => (
                        <button key={c.chatId}
                            onClick={() => openChatById(c.chatId, c)}
                            className="grid grid-cols-[46px_1fr_auto] gap-2 p-2 rounded-xl text-left hover:bg-white/10">
                            <img className="w-11 h-11 rounded-full" src={c.otherPhoto || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(c.otherUid)}`} />
                            <div className="truncate">
                                <div className="font-semibold truncate">{c.otherName || 'User'}</div>
                                <div className="text-sm text-[#b7bde3] truncate">{c.lastMessage || 'Say hi 👋'}</div>
                            </div>
                            <div className="text-sm text-[#a8b0d6] self-center">{timeAgo(c.updatedAt)}</div>
                        </button>
                    ))}
                    {recentChats.length === 0 && <div className="text-sm text-[#a8b0d6] px-2">No chats yet.</div>}
                </div>
            </div>


            <button onClick={logout} className="w-full py-2 rounded-xl bg-white/10 border border-white/20">Logout</button>
        </aside>
    )
}


function timeAgo(ts) {
    const d = ts instanceof Date ? ts : (ts?.toDate?.() || new Date())
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}