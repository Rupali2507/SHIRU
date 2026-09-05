import React, {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import DashboardNav from '../components/DashboardNav'
import { chatWithAI } from '../services/aiService'

const STORAGE_KEY = 'shiruChats'

const AIChat = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const params =
    new URLSearchParams(location.search)

  const query =
    params.get('query') || ''

  const urlChatId =
    params.get('chatId') || ''

  // =========================================================
  // CHAT STATE
  // =========================================================

  const [chatId, setChatId] =
    useState(urlChatId)

  const [message, setMessage] =
    useState('')

  const [messages, setMessages] =
    useState([])

  const [productContext, setProductContext] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  // =========================================================
  // VOICE STATE
  // =========================================================

  const [isListening, setIsListening] =
    useState(false)

  const [voiceSupported, setVoiceSupported] =
    useState(true)

  const recognitionRef =
    useRef(null)

  const initialQuerySent =
    useRef(false)

  // =========================================================
  // RECENT CHATS
  // =========================================================

  const [recentChats, setRecentChats] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || '[]'
        )
      } catch {
        return []
      }
    })

  // =========================================================
  // SPEECH RECOGNITION SETUP
  // =========================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return
    }

    const recognition =
      new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false

    // Indian English
    recognition.lang = 'en-IN'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript?.trim()

      if (!transcript) {
        setIsListening(false)
        return
      }

      setMessage(transcript)

      // Automatically send voice command
      sendMessage(transcript)
    }

    recognition.onerror = (event) => {
      console.error(
        'Speech recognition error:',
        event.error
      )

      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current =
      recognition

    return () => {
      try {
        recognition.stop()
      } catch {
        // Recognition may already be stopped
      }

      recognitionRef.current =
        null
    }

    // sendMessage is intentionally referenced
    // from the component scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  const speakResponse = (text) => {
    if (!text) return

    if (
      !('speechSynthesis' in window)
    ) {
      return
    }

    // Stop anything currently speaking
    window.speechSynthesis.cancel()

    const cleanText =
      text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s?/g, '')
        .replace(/•/g, '')
        .replace(/\n+/g, '. ')
        .trim()

    if (!cleanText) return

    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      )

    utterance.lang = 'en-IN'
    utterance.rate = 0.95
    utterance.pitch = 1

    window.speechSynthesis.speak(
      utterance
    )
  }

  // =========================================================
  // STOP SPEAKING
  // =========================================================

  const stopSpeaking = () => {
    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel()
    }
  }

  // =========================================================
  // TOGGLE VOICE
  // =========================================================

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert(
        'Voice input is not supported in this browser.'
      )
      return
    }

    if (!recognitionRef.current) {
      return
    }

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }

      setIsListening(false)
      return
    }

    // Stop SHIRU from speaking while
    // starting a new voice request.
    stopSpeaking()

    setMessage('')

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error(
        'Could not start voice recognition:',
        error
      )
    }
  }

  // =========================================================
  // SHIRU GREETING (VOICE-FIRST WELCOME)
  // =========================================================
  // Shown/spoken whenever the user lands on a fresh chat
  // (e.g. clicking "Ask" on /app with no typed query, or
  // starting a new chat). SHIRU greets out loud, then starts
  // listening automatically so the user can just talk.
  // =========================================================

  const greetedRef = useRef(false)

  const greetUser = () => {
    const greeting =
      "Hi! I'm SHIRU, your personal shopping assistant. How can I help you today?"

    setMessages([
      {
        role: 'assistant',
        content: greeting,
      },
    ])

    if (!('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance =
      new SpeechSynthesisUtterance(greeting)

    utterance.lang = 'en-IN'
    utterance.rate = 0.95
    utterance.pitch = 1

    // Once SHIRU finishes speaking, start
    // listening for the user's voice response.
    utterance.onend = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // May already be running
        }
      }
    }

    window.speechSynthesis.speak(
      utterance
    )
  }

  // Greet on first landing on a fresh /chat
  // (no query to answer, no existing chat to load).
  useEffect(() => {
    if (query) return

    if (urlChatId) return

    if (greetedRef.current) return

    greetedRef.current = true

    greetUser()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlChatId])

  // =========================================================
  // DELETE CHAT
  // =========================================================

  const deleteChat = (id, e) => {
    e.stopPropagation()

    const updated =
      recentChats.filter(
        (chat) => chat.id !== id
      )

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    )

    setRecentChats(updated)

    if (id === chatId) {
      setChatId('')
      setMessages([])
      setProductContext([])
      setMessage('')

      initialQuerySent.current =
        false

      stopSpeaking()

      navigate('/chat')

      greetUser()
    }
  }

  // =========================================================
  // LOAD EXISTING CHAT
  // =========================================================

  useEffect(() => {
    if (!urlChatId) return

    const chats =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        ) || '[]'
      )

    const existingChat =
      chats.find(
        (chat) =>
          chat.id === urlChatId
      )

    if (!existingChat) return

    setChatId(existingChat.id)

    setMessages(
      existingChat.messages || []
    )

    setProductContext(
      existingChat.productContext || []
    )

    // Prevent URL query from
    // starting another request.
    initialQuerySent.current =
      true

    stopSpeaking()
  }, [urlChatId])

  // =========================================================
  // START NEW CHAT FROM DASHBOARD QUERY
  // =========================================================

  useEffect(() => {
    if (!query) return

    if (urlChatId) return

    if (initialQuerySent.current) {
      return
    }

    initialQuerySent.current =
      true

    sendMessage(query)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlChatId])

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) {
      return
    }

    const userMessage =
      text.trim()

    const newUserMessage = {
      role: 'user',
      content: userMessage,
    }

    // History BEFORE current message
    const history =
      messages.map((item) => ({
        role: item.role,
        content: item.content,
      }))

    const updatedMessages = [
      ...messages,
      newUserMessage,
    ]

    setMessages(
      updatedMessages
    )

    setLoading(true)

    try {
      const data =
        await chatWithAI({
          message: userMessage,
          history,
          productContext,
        })

      const assistantResponse =
        data.response ||
        'I could not generate a response.'

      const assistantMessage = {
        role: 'assistant',
        content: assistantResponse,
      }

      const finalMessages = [
        ...updatedMessages,
        assistantMessage,
      ]

      setMessages(
        finalMessages
      )

      const newProductContext =
        data.productContext || []

      setProductContext(
        newProductContext
      )

      // =====================================================
      // 🔊 SPEAK SHIRU RESPONSE
      // =====================================================

      speakResponse(
        assistantResponse
      )

      // =====================================================
      // CREATE CHAT ID
      // =====================================================

      let currentChatId =
        chatId

      if (!currentChatId) {
        currentChatId =
          crypto.randomUUID()

        setChatId(
          currentChatId
        )

        navigate(
          `/chat?chatId=${currentChatId}`,
          {
            replace: true,
          }
        )
      }

      // =====================================================
      // SAVE CONVERSATION
      // =====================================================

      saveConversation({
        id: currentChatId,

        firstMessage:
          messages.length === 0
            ? userMessage
            : undefined,

        messages:
          finalMessages,

        productContext:
          newProductContext,
      })

    } catch (error) {
      console.error(
        'AI chat error:',
        error
      )

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

      setMessages(
        finalMessages
      )

      let currentChatId =
        chatId

      if (!currentChatId) {
        currentChatId =
          crypto.randomUUID()

        setChatId(
          currentChatId
        )

        navigate(
          `/chat?chatId=${currentChatId}`,
          {
            replace: true,
          }
        )
      }

      saveConversation({
        id: currentChatId,

        firstMessage:
          messages.length === 0
            ? userMessage
            : undefined,

        messages:
          finalMessages,

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
    productContext:
      conversationProducts,
  }) => {

    let chats = []

    try {
      chats =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || '[]'
        )
    } catch {
      chats = []
    }

    const existingIndex =
      chats.findIndex(
        (chat) =>
          chat.id === id
      )

    let updatedChat

    if (existingIndex !== -1) {

      updatedChat = {
        ...chats[existingIndex],

        messages:
          conversationMessages,

        productContext:
          conversationProducts,

        updatedAt:
          Date.now(),
      }

      chats[existingIndex] =
        updatedChat

    } else {

      updatedChat = {
        id,

        title:
          firstMessage?.slice(
            0,
            50
          ) ||
          'New shopping chat',

        messages:
          conversationMessages,

        productContext:
          conversationProducts,

        createdAt:
          Date.now(),

        updatedAt:
          Date.now(),
      }

      chats.push(
        updatedChat
      )
    }

    // Most recently updated first
    chats.sort(
      (a, b) =>
        b.updatedAt -
        a.updatedAt
    )

    // Keep last 20
    chats =
      chats.slice(0, 20)

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

    if (!message.trim()) {
      return
    }

    const text =
      message.trim()

    setMessage('')

    stopSpeaking()

    await sendMessage(text)
  }

  // =========================================================
  // OPEN RECENT CHAT
  // =========================================================

  const openChat = (id) => {
    stopSpeaking()

    navigate(
      `/chat?chatId=${id}`
    )
  }

  // =========================================================
  // NEW CHAT
  // =========================================================

  const startNewChat = () => {
    stopSpeaking()

    setChatId('')
    setMessages([])
    setProductContext([])
    setMessage('')
    setLoading(false)
    setIsListening(false)

    initialQuerySent.current =
      false

    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Already stopped
      }
    }

    navigate('/chat')

    greetUser()
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="h-screen overflow-hidden bg-black text-white">

      <DashboardNav
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        eyebrow="AI buyer"
      />

      {/* ================================================= */}
      {/* MAIN LAYOUT */}
      {/* ================================================= */}

      <div className="flex h-[calc(100vh-80px)] overflow-hidden pt-[80px]">

        {/* ================================================= */}
        {/* RECENT CHATS */}
        {/* ================================================= */}

        <aside
          className="
            hidden
            h-[calc(100vh-80px)]
            w-[280px]
            shrink-0
            overflow-y-auto
            border-r
            border-white/[0.08]
            bg-[#080808]
            md:block
          "
        >

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
              onClick={
                startNewChat
              }
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

              recentChats.map(
                (chat) => (

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

                    <button
                      onClick={() =>
                        openChat(
                          chat.id
                        )
                      }
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
                        deleteChat(
                          chat.id,
                          e
                        )
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

                )
              )

            )}

          </div>

        </aside>

        {/* ================================================= */}
        {/* CHAT */}
        {/* ================================================= */}

        <section
          className="
            flex
            min-w-0
            flex-1
            flex-col
            overflow-hidden
          "
        >

          {/* Header */}

          <div
            className="
              shrink-0
              border-b
              border-white/[0.08]
              px-6
              py-5
              md:px-10
            "
          >

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

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-6
              py-8
              md:px-10
            "
          >

            <div className="mx-auto max-w-3xl space-y-6">

              {/* Empty state */}

              {messages.length === 0 && (

                <div className="flex min-h-[55vh] items-center justify-center">

                  <div className="text-center">

                    <div
                      className="
                        mx-auto
                        mb-6
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-white/[0.03]
                      "
                    >

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6 text-white/50"
                      >

                        <rect
                          x="9"
                          y="3"
                          width="6"
                          height="11"
                          rx="3"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 11a7 7 0 0 0 14 0"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18v3"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 21h8"
                        />

                      </svg>

                    </div>

                    <h2 className="text-[28px] font-medium">
                      What are you looking for?
                    </h2>

                    <p className="mt-3 text-[12px] text-white/30">
                      Tell me your preferences,
                      budget or what you're
                      shopping for.
                    </p>

                    <p className="mt-2 text-[11px] text-white/20">
                      Or tap the microphone
                      and talk to SHIRU.
                    </p>

                  </div>

                </div>

              )}

              {/* Messages */}

              {messages.map(
                (item, index) => (

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

                )
              )}

              {/* Loading */}

              {loading && (

                <div className="flex justify-start">

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-[#111111]
                      px-5
                      py-4
                      text-[11px]
                      text-white/30
                    "
                  >

                    <span>
                      SHIRU is thinking
                    </span>

                    <span className="flex gap-1">

                      <span className="h-1 w-1 animate-pulse rounded-full bg-white/40" />

                      <span className="h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:150ms]" />

                      <span className="h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:300ms]" />

                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* INPUT */}
          {/* ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-white/[0.08]
              bg-black
              px-6
              py-5
              md:px-10
            "
          >

            <form
              onSubmit={
                handleSubmit
              }
              className="
                mx-auto
                flex
                max-w-3xl
                gap-3
              "
            >

              {/* Input + Mic */}

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  rounded-full
                  border
                  border-white/10
                  bg-[#111111]
                  px-2
                  transition
                  focus-within:border-white/20
                "
              >

                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder={
                    isListening
                      ? 'Listening...'
                      : 'Ask SHIRU anything...'
                  }
                  disabled={loading}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-4
                    py-3
                    text-[12px]
                    text-white
                    outline-none
                    placeholder:text-white/25
                  "
                />

                {/* ================================================= */}
                {/* MICROPHONE BUTTON */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={
                    toggleVoice
                  }
                  disabled={
                    loading ||
                    !voiceSupported
                  }
                  aria-label={
                    isListening
                      ? 'Stop listening'
                      : 'Start voice input'
                  }
                  title={
                    isListening
                      ? 'Stop listening'
                      : 'Talk to SHIRU'
                  }
                  className={`
                    mr-1
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition
                    ${
                      isListening
                        ? `
                          bg-white
                          text-black
                          shadow-[0_0_20px_rgba(255,255,255,0.15)]
                        `
                        : `
                          text-white/45
                          hover:bg-white/[0.08]
                          hover:text-white
                        `
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-20
                  `}
                >

                  {isListening ? (

                    <div className="flex items-center gap-[2px]">

                      <span className="h-3 w-[2px] animate-pulse rounded-full bg-current" />

                      <span className="h-5 w-[2px] animate-pulse rounded-full bg-current" />

                      <span className="h-3 w-[2px] animate-pulse rounded-full bg-current" />

                      <span className="h-4 w-[2px] animate-pulse rounded-full bg-current" />

                    </div>

                  ) : (

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >

                      <rect
                        x="9"
                        y="3"
                        width="6"
                        height="11"
                        rx="3"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 11a7 7 0 0 0 14 0"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v3"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 21h8"
                      />

                    </svg>

                  )}

                </button>

              </div>

              {/* ================================================= */}
              {/* SEND */}
              {/* ================================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !message.trim()
                }
                className="
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-[11px]
                  font-medium
                  text-black
                  transition
                  hover:bg-white/90
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Send
              </button>

            </form>

            {/* Voice status */}

            {!voiceSupported && (

              <p className="mx-auto mt-2 max-w-3xl text-center text-[9px] text-white/20">
                Voice input is not supported
                in this browser.
              </p>

            )}

            {isListening && (

              <p className="mx-auto mt-2 max-w-3xl text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                Listening to you...
              </p>

            )}

          </div>

        </section>

      </div>

    </main>
  )
}

export default AIChat