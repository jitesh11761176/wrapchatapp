"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Send, Users, Bot, MessageCircle, Mail } from "lucide-react"
import AIAssistantModal from "@/components/ai-assistant-modal"

interface ChatRoom {
  id: string
  name: string
  description?: string
  members: Array<{
    user: {
      id: string
      name: string
      image?: string
    }
  }>
  messages?: Array<{
    id: string
    content: string
    type: string
    createdAt: string
    user?: {
      id: string
      name: string
      image?: string
    }
  }>
}

interface Message {
  id: string
  content: string
  type: "TEXT" | "AI" | "EMOJI" | "GIF"
  createdAt: string
  user?: {
    id: string
    name: string
    image?: string
  }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDescription, setNewRoomDescription] = useState("")
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/chat/rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedRoom) return
    
    try {
      const res = await fetch(`/api/chat/${selectedRoom}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const createRoom = async () => {
    if (!newRoomName.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
        }),
      })

      if (res.ok) {
        const newRoom = await res.json()
        setRooms([newRoom, ...rooms])
        setNewRoomName("")
        setNewRoomDescription("")
        setShowCreateRoom(false)
        setSelectedRoom(newRoom.id)
      }
    } catch (error) {
      console.error("Error creating room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/${roomId}/join`, {
        method: "POST",
      })

      if (res.ok) {
        setSelectedRoom(roomId)
        fetchRooms() // Refresh to show updated membership
      }
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/chat/${selectedRoom}/messages`, {
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
        // Add both user message and AI message if present
        const newMessages = [data.userMessage]
        if (data.aiMessage) {
          newMessages.push(data.aiMessage)
        }
        setMessages([...messages, ...newMessages])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
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

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const currentRoom = rooms.find(r => r.id === selectedRoom)
  const isMemberOfSelectedRoom = currentRoom?.members.some(
    member => member.user.id === session.user.id
  )

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
              <h1 className="text-2xl font-bold text-gray-900">Chat Rooms</h1>
            </div>
            <div className="flex items-center">
              <Link href="/messages">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Direct Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Room List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Rooms</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateRoom(!showCreateRoom)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {showCreateRoom && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                    <Input
                      placeholder="Room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={createRoom}
                        disabled={isLoading}
                      >
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCreateRoom(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {rooms.map((room) => {
                    const isMember = room.members.some(
                      member => member.user.id === session.user.id
                    )
                    
                    return (
                      <div
                        key={room.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedRoom === room.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          if (isMember) {
                            setSelectedRoom(room.id)
                          } else {
                            joinRoom(room.id)
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{room.name}</h3>
                            {room.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {room.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Users className="w-3 h-3 mr-1" />
                            {room.members.length}
                          </div>
                        </div>
                        {!isMember && (
                          <Button size="sm" className="mt-2 w-full">
                            Join Room
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedRoom && isMemberOfSelectedRoom ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentRoom?.name}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {currentRoom?.members.length} members
                    </div>
                  </CardTitle>
                  {currentRoom?.description && (
                    <CardDescription>{currentRoom.description}</CardDescription>
                  )}
                </CardHeader>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user?.id === session.user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.user?.id === session.user.id
                            ? "bg-blue-500 text-white"
                            : message.type === "AI"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {message.type === "AI" && (
                          <div className="flex items-center mb-1 text-xs">
                            <Bot className="w-3 h-3 mr-1" />
                            AI Assistant
                          </div>
                        )}
                        {message.user && message.type !== "AI" && (
                          <div className="text-xs opacity-75 mb-1">
                            {message.user.name}
                          </div>
                        )}
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
                      placeholder="Type your message... (mention @ai for AI assistance)"
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
                  <div className="text-gray-500">
                    {selectedRoom
                      ? "Join the room to start chatting"
                      : "Select a room to start chatting"}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        onClick={() => setIsAIAssistantOpen(true)}
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </div>
  )
}
