import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { auth, db } from '../firebase.js'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext.jsx'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [recentChats, setRecentChats] = useState([])
  const [active, setActive] = useState(null) // {chatId, otherUid, otherName, otherPhoto}
  const [messages, setMessages] = useState([])

  const messagesUnsub = useRef(null)
  const recentUnsub = useRef(null)

  // Load recent chats
  useEffect(() => {
    if (!user) {
      setRecentChats([])
      return
    }
    const ucRef = collection(db, 'userChats', user.uid, 'items')
    const qy = query(ucRef, orderBy('updatedAt', 'desc'))
    recentUnsub.current?.()
    recentUnsub.current = onSnapshot(qy, (qs) => {
      const items = qs.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRecentChats(items)
    })
    return () => recentUnsub.current?.()
  }, [user])

  const openChatById = async (chatId, meta) => {
    setActive({ chatId, ...meta })
    // Cleanup previous
    messagesUnsub.current?.()
    const msgsRef = collection(db, 'chats', chatId, 'messages')
    const qy = query(msgsRef, orderBy('createdAt', 'asc'))
    messagesUnsub.current = onSnapshot(qy, (qs) => {
      const list = qs.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        isMe: d.data().senderId === auth.currentUser?.uid,
      }))
      setMessages(list)
      // auto scroll handled by CSS overflow; consumers can add refs if needed
    })
  }

  const startChatWith = async (otherUid) => {
    const me = auth.currentUser
    if (!me || me.uid === otherUid) return

    const chatId = composeChatId(me.uid, otherUid)
    const chatRef = doc(db, 'chats', chatId)
    const chatSnap = await getDoc(chatRef)

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        chatId,
        participants: [me.uid, otherUid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: '',
      })
    }

    // mirror entries for both users
    const other = await getDoc(doc(db, 'users', otherUid))
    const meUser = await getDoc(doc(db, 'users', me.uid))

    await setDoc(
      doc(db, 'userChats', me.uid, 'items', chatId),
      {
        chatId,
        otherUid,
        otherName: other.data()?.name || 'User',
        otherPhoto: other.data()?.photoURL || '',
        lastMessage: '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    await setDoc(
      doc(db, 'userChats', otherUid, 'items', chatId),
      {
        chatId,
        otherUid: me.uid,
        otherName: meUser.data()?.name || 'User',
        otherPhoto: meUser.data()?.photoURL || '',
        lastMessage: '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    await openChatById(chatId, {
      otherUid,
      otherName: other.data()?.name,
      otherPhoto: other.data()?.photoURL,
    })
  }

  const sendMessage = async (text) => {
    if (!active?.chatId) return
    const me = auth.currentUser
    if (!me) return

    const msgsRef = collection(db, 'chats', active.chatId, 'messages')
    await addDoc(msgsRef, { text, senderId: me.uid, createdAt: serverTimestamp() })

    // update chat and mirrors
    const chatRef = doc(db, 'chats', active.chatId)
    await updateDoc(chatRef, { lastMessage: text, updatedAt: serverTimestamp() })

    // get other uid from chatId
    const [a, b] = active.chatId.split('_')
    const otherUid = me.uid === a ? b : a
    await updateDoc(doc(db, 'userChats', me.uid, 'items', active.chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'userChats', otherUid, 'items', active.chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    })
  }

  const value = useMemo(
    () => ({
      recentChats,
      active,
      messages,
      openChatById,
      startChatWith,
      sendMessage,
    }),
    [recentChats, active, messages]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  return useContext(ChatContext)
}

function composeChatId(a, b) {                
  if (a < b) {
    return `${a}_${b}`
  } else {
    return `${b}_${a}`
  }
}
