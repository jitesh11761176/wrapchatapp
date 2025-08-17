"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  content: string
  type: "user" | "ai"
  timestamp: Date
}

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when first opened
      const welcomeMessage: Message = {
        id: "welcome",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        type: "ai",
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          history: messages.filter(m => m.id !== "welcome").map(m => ({
            role: m.type === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          }))
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          type: "ai",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error("Failed to get AI response")
      }
    } catch (error) {
      console.error("Error sending message to AI:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        type: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      type: "ai",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-lg shadow-xl transition-all ${
          isMinimized 
            ? "w-80 h-16" 
            : "w-full max-w-lg h-[500px] mx-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 h-[320px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center mb-1 text-xs">
                      {message.type === "user" ? (
                        <User className="w-3 h-3 mr-1" />
                      ) : (
                        <Bot className="w-3 h-3 mr-1" />
                      )}
                      {message.type === "user" ? "You" : "AI Assistant"}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="w-3 h-3 mr-1" />
                      <span className="text-xs">AI Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearConversation}
                >
                  Clear Chat
                </Button>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Press Enter to send • This is your personal AI assistant
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
