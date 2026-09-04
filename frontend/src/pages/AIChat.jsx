import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import { chatWithAI } from '../services/aiService'

const STORAGE_KEY = 'shiruChats'

const AIChat = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)

  const query = params.get('query') || ''
  const urlChatId = params.get('chatId') || ''

  const [chatId, setChatId] = useState(urlChatId)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [productContext, setProductContext] = useState([])
  const [loading, setLoading] = useState(false)
  const deleteChat = (id, e) => {
  e.stopPropagation()

  const updated = recentChats.filter(
    (chat) => chat.id !== id
  )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  )

  setRecentChats(updated)

  // If deleting the currently open chat,
  // start a fresh chat.
  if (id === chatId) {
    setChatId('')
    setMessages([])
    setProductContext([])
    setMessage('')
    initialQuerySent.current = false

    navigate('/chat')
  }
}
  const [recentChats, setRecentChats] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      )
    } catch {
      return []
    }
  })

  const initialQuerySent = useRef(false)

  // =========================================================
  // LOAD EXISTING CHAT
  // =========================================================

  useEffect(() => {
    if (!urlChatId) return

    const chats = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )

    const existingChat = chats.find(
      (chat) => chat.id === urlChatId
    )

    if (!existingChat) return

    setChatId(existingChat.id)
    setMessages(existingChat.messages || [])
    setProductContext(existingChat.productContext || [])

    // Prevent URL query from starting a new request
    initialQuerySent.current = true
  }, [urlChatId])

  // =========================================================
  // START NEW CHAT FROM DASHBOARD QUERY
  // =========================================================

  useEffect(() => {
    if (!query) return

    // If this is an existing chat, don't send the query again
    if (urlChatId) return

    if (initialQuerySent.current) return

    initialQuerySent.current = true

    sendMessage(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlChatId])

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMessage = text.trim()

    const newUserMessage = {
      role: 'user',
      content: userMessage,
    }

    // Keep history BEFORE adding current message
    const history = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }))

    const updatedMessages = [
      ...messages,
      newUserMessage,
    ]

    setMessages(updatedMessages)
    setLoading(true)

    try {
      const data = await chatWithAI({
        message: userMessage,
        history,
        productContext,
      })

      const assistantMessage = {
        role: 'assistant',
        content:
          data.response ||
          'I could not generate a response.',
      }

      const finalMessages = [
        ...updatedMessages,
        assistantMessage,
      ]

      setMessages(finalMessages)

      const newProductContext =
        data.productContext || []

      setProductContext(newProductContext)

      // Create chat ID if this is a brand-new conversation
      let currentChatId = chatId

      if (!currentChatId) {
        currentChatId =
          crypto.randomUUID()

        setChatId(currentChatId)

        // Update URL so future messages use same chat
        navigate(
          `/chat?chatId=${currentChatId}`,
          { replace: true }
        )
      }

      saveConversation({
        id: currentChatId,
        firstMessage:
          messages.length === 0
            ? userMessage
            : undefined,
        messages: finalMessages,
        productContext: newProductContext,
      })

    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content:
          error.message ||
          'Something went wrong. Please try again.',
      }

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ]

      setMessages(finalMessages)

      // We still save the conversation so the user's
      // conversation doesn't disappear.
      let currentChatId = chatId

      if (!currentChatId) {
        currentChatId =
          crypto.randomUUID()

        setChatId(currentChatId)

        navigate(
          `/chat?chatId=${currentChatId}`,
          { replace: true }
        )
      }

      saveConversation({
        id: currentChatId,
        firstMessage:
          messages.length === 0
            ? userMessage
            : undefined,
        messages: finalMessages,
        productContext,
      })

    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // SAVE / UPDATE CONVERSATION
  // =========================================================

  const saveConversation = ({
    id,
    firstMessage,
    messages: conversationMessages,
    productContext: conversationProducts,
  }) => {
    let chats = []

    try {
      chats = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      )
    } catch {
      chats = []
    }

    const existingIndex = chats.findIndex(
      (chat) => chat.id === id
    )

    let updatedChat

    if (existingIndex !== -1) {
      // ============================================
      // EXISTING CHAT → UPDATE IT
      // ============================================

      updatedChat = {
        ...chats[existingIndex],
        messages: conversationMessages,
        productContext: conversationProducts,
        updatedAt: Date.now(),
      }

      chats[existingIndex] = updatedChat

    } else {
      // ============================================
      // NEW CHAT → CREATE IT
      // ============================================

      updatedChat = {
        id,
        title:
          firstMessage?.slice(0, 50) ||
          'New shopping chat',
        messages: conversationMessages,
        productContext: conversationProducts,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      chats.push(updatedChat)
    }

    // Most recently updated chat first
    chats.sort(
      (a, b) =>
        b.updatedAt - a.updatedAt
    )

    // Keep last 20 conversations
    chats = chats.slice(0, 20)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(chats)
    )

    setRecentChats(chats)
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    const text = message.trim()

    setMessage('')

    await sendMessage(text)
  }

  // =========================================================
  // OPEN RECENT CHAT
  // =========================================================

  const openChat = (id) => {
    navigate(`/chat?chatId=${id}`)
  }

  // =========================================================
  // NEW CHAT
  // =========================================================

  const startNewChat = () => {
    setChatId('')
    setMessages([])
    setProductContext([])
    setMessage('')
    setLoading(false)

    initialQuerySent.current = false

    navigate('/chat')
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <DashboardNav
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        eyebrow="AI buyer"
      />

      <div className="flex min-h-screen pt-[80px]">

        {/* ================================================= */}
        {/* RECENT CHATS */}
        {/* ================================================= */}

        <aside className="hidden w-[280px] shrink-0 border-r border-white/[0.08] bg-[#080808] md:block">

          <div className="flex items-center justify-between px-6 py-7">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                SHIRU
              </p>

              <h2 className="mt-2 text-[15px] font-medium">
                Recent chats
              </h2>
            </div>

          </div>

          {/* New chat */}

          <div className="px-3 pb-3">

            <button
              onClick={startNewChat}
              className="
                w-full
                rounded-xl
                border
                border-white/[0.08]
                px-3
                py-3
                text-left
                text-[11px]
                text-white/50
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              + New shopping chat
            </button>

          </div>

          {/* Chat list */}

          <div className="px-3">

            {recentChats.length === 0 ? (

              <p className="px-3 py-5 text-[11px] text-white/25">
                No recent chats
              </p>

            ) : (

              recentChats.map((chat) => (

                <div
  key={chat.id}
  className={`
    group
    mb-1
    flex
    w-full
    items-center
    rounded-xl
    transition
    ${
      chat.id === chatId
        ? 'bg-white/[0.08]'
        : 'hover:bg-white/[0.05]'
    }
  `}
>
  {/* Chat */}

  <button
    onClick={() => openChat(chat.id)}
    className={`
      min-w-0
      flex-1
      truncate
      px-3
      py-3
      text-left
      text-[11px]
      ${
        chat.id === chatId
          ? 'text-white'
          : 'text-white/50 group-hover:text-white'
      }
    `}
  >
    {chat.title}
  </button>

  {/* Delete */}

  <button
    onClick={(e) =>
      deleteChat(chat.id, e)
    }
    aria-label="Delete chat"
    className="
      mr-2
      flex
      h-6
      w-6
      shrink-0
      items-center
      justify-center
      rounded-md
      text-white/20
      opacity-0
      transition
      hover:bg-white/[0.08]
      hover:text-white/70
      group-hover:opacity-100
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h18"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 6V4h8v2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 6l-1 14H6L5 6"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 11v5M14 11v5"
      />
    </svg>
  </button>

</div>

              ))

            )}

          </div>

        </aside>

        {/* ================================================= */}
        {/* CHAT */}
        {/* ================================================= */}

        <section className="flex min-w-0 flex-1 flex-col">

          {/* Header */}

          <div className="border-b border-white/[0.08] px-6 py-5 md:px-10">

            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">
              Personal shopping assistant
            </p>

            <h1 className="mt-2 text-[18px] font-medium">
              SHIRU
            </h1>

          </div>

          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">

            <div className="mx-auto max-w-3xl space-y-6">

              {messages.length === 0 && (

                <div className="flex min-h-[55vh] items-center justify-center">

                  <div className="text-center">

                    <h2 className="text-[28px] font-medium">
                      What are you looking for?
                    </h2>

                    <p className="mt-3 text-[12px] text-white/30">
                      Tell me your preferences, budget or
                      what you're shopping for.
                    </p>

                  </div>

                </div>

              )}

              {messages.map((item, index) => (

                <div
                  key={index}
                  className={
                    item.role === 'user'
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }
                >

                  <div
                    className={
                      item.role === 'user'
                        ? `
                          max-w-[75%]
                          rounded-2xl
                          rounded-br-md
                          bg-white
                          px-5
                          py-3
                          text-[12px]
                          leading-6
                          text-black
                        `
                        : `
                          max-w-[75%]
                          rounded-2xl
                          rounded-bl-md
                          border
                          border-white/[0.08]
                          bg-[#111111]
                          px-5
                          py-4
                          text-[12px]
                          leading-6
                          text-white/70
                        `
                    }
                  >
                    {item.content}
                  </div>

                </div>

              ))}

              {loading && (

                <div className="flex justify-start">

                  <div className="rounded-2xl border border-white/[0.08] bg-[#111111] px-5 py-4 text-[11px] text-white/30">
                    SHIRU is thinking...
                  </div>

                </div>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* INPUT */}
          {/* ================================================= */}

          <div className="border-t border-white/[0.08] px-6 py-5 md:px-10">

            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-3xl gap-3"
            >

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Ask SHIRU anything..."
                disabled={loading}
                className="
                  flex-1
                  rounded-full
                  border
                  border-white/10
                  bg-[#111111]
                  px-5
                  py-3
                  text-[12px]
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-white/25
                "
              />

              <button
                type="submit"
                disabled={
                  loading || !message.trim()
                }
                className="
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-[11px]
                  font-medium
                  text-black
                  disabled:opacity-40
                "
              >
                Send
              </button>

            </form>

          </div>

        </section>

      </div>

    </main>
  )
}

export default AIChat