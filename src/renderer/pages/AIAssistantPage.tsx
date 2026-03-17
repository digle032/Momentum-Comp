import { useEffect, useRef, useState } from 'react'
import { BrainCircuit, Trash2 } from 'lucide-react'
import { useCoachingStore, ChatMessage } from '../store/coachingStore'
import { streamAssistantResponse } from '../services/aiAssistantService'
import { PlaceholdersAndVanishInput } from '../components/ai/PlaceholdersAndVanishInput'
import { ChatMessage as ChatMessageComponent } from '../components/ai/ChatMessage'

const PLACEHOLDERS = [
  'How did Marcus do this week?',
  'Who has improved the most this month?',
  'Show me all 3-star clips from the last session.',
  'What drills did we work on yesterday?',
  'Give me a weekly summary for all athletes.',
  'Which athlete is closest to their goal?',
  "What's Sophia's best 200m time so far?",
]

export function AIAssistantPage() {
  const chatHistory = useCoachingStore((s) => s.chatHistory)
  const addChatMessage = useCoachingStore((s) => s.addChatMessage)
  const clearChatHistory = useCoachingStore((s) => s.clearChatHistory)
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSendMessage = async (question: string) => {
    if (isStreaming) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    addChatMessage(userMessage)
    setIsStreaming(true)

    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '…',
      timestamp: new Date().toISOString(),
    }
    addChatMessage(assistantMessage)

    let fullResponse = ''
    try {
      // Pass history BEFORE the new user message to avoid confusion
      const historyForContext = useCoachingStore.getState().chatHistory.slice(0, -1)
      for await (const chunk of streamAssistantResponse(question, historyForContext)) {
        fullResponse += chunk
        useCoachingStore.setState((state) => ({
          chatHistory: state.chatHistory.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg
          ),
        }))
      }
    } catch (error) {
      useCoachingStore.setState((state) => ({
        chatHistory: state.chatHistory.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "I couldn't connect to the AI service. Please check your API key." }
            : msg
        ),
      }))
    }

    setIsStreaming(false)
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BrainCircuit size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-foreground">Momentum AI</h1>
            <p className="text-xs text-muted-foreground">Your expert coaching assistant</p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button
            className="btn-ghost text-xs gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={clearChatHistory}
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Chat area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4 py-20">
            <BrainCircuit size={48} className="opacity-20" />
            <div>
              <h2 className="text-xl font-serif text-foreground mb-2">Ask me anything.</h2>
              <p className="text-sm max-w-sm">
                I have full access to your athletes, sessions, progress data, and clips. Try one of the suggestions below.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
              {PLACEHOLDERS.slice(0, 4).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/60 text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => <ChatMessageComponent key={msg.id} message={msg} />)
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs pl-12">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-xl shrink-0">
        <PlaceholdersAndVanishInput
          placeholders={PLACEHOLDERS}
          onChange={() => {}}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  )
}
