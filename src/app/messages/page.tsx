"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Send, Search, User, MessageCircle } from "lucide-react"

interface DirectMessage {
  id: string
  content: string
  type: string
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface Conversation {
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  latestMessage?: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

interface SearchUser {
  id: string
  name: string
  email: string
  image?: string
}

export default function DirectMessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll for new messages
      return () => clearInterval(interval)
    }
  }, [selectedUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/direct-messages/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedUserId) return
    
    try {
      const res = await fetch(`/api/direct-messages/${selectedUserId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setSelectedUser(data.otherUser)
        // Refresh conversations to update unread counts
        fetchConversations()
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const searchUsers = async () => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/direct-messages/${selectedUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          type: "TEXT",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...messages, data])
        setNewMessage("")
        fetchConversations() // Refresh conversation list
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startConversation = (user: SearchUser) => {
    setSelectedUserId(user.id)
    setSelectedUser(user)
    setShowUserSearch(false)
    setSearchQuery("")
    setSearchResults([])
    // Add to conversations if not already there
    const existingConv = conversations.find(c => c.user.id === user.id)
    if (!existingConv) {
      setConversations([
        {
          user,
          unreadCount: 0
        },
        ...conversations
      ])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Direct Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Messages</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowUserSearch(!showUserSearch)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {showUserSearch && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => startConversation(user)}
                          >
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || ""}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedUserId === conversation.user.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedUserId(conversation.user.id)
                        setSelectedUser(conversation.user)
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {conversation.user.image ? (
                            <img
                              src={conversation.user.image}
                              alt={conversation.user.name || ""}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{conversation.user.name}</h3>
                            {conversation.latestMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.latestMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 mb-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                          {conversation.latestMessage && (
                            <span className="text-xs text-gray-400">
                              {new Date(conversation.latestMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-3">
            {selectedUserId && selectedUser ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name || ""}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span>{selectedUser.name}</span>
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === session.user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === session.user.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-h-[60px] max-h-32 resize-none"
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={sendMessage}
                        disabled={isLoading || !newMessage.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">
                    Select a conversation to start messaging
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
