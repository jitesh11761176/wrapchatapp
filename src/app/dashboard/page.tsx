"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Settings, Bot, MessageCircle, Mail, Plus, Search, Users, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import AIAssistantModal from "@/components/ai-assistant-modal"
import ResizableChatWindow from "@/components/resizable-chat-window"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [activeView, setActiveView] = useState('home')
  const [conversations, setConversations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [chatWindows, setChatWindows] = useState<Array<{
    id: string
    title: string
    type: 'direct' | 'room' | 'ai'
    isMinimized: boolean
    position: { x: number; y: number }
  }>>([])

  // Window management functions
  const openChatWindow = (title: string, type: 'direct' | 'room' | 'ai') => {
    const id = `${type}-${Date.now()}`
    const newWindow = {
      id,
      title,
      type,
      isMinimized: false,
      position: { 
        x: 200 + (chatWindows.length * 50), 
        y: 150 + (chatWindows.length * 50) 
      }
    }
    setChatWindows([...chatWindows, newWindow])
  }

  const closeChatWindow = (id: string) => {
    setChatWindows(chatWindows.filter(window => window.id !== id))
  }

  const minimizeChatWindow = (id: string) => {
    setChatWindows(chatWindows.map(window => 
      window.id === id ? { ...window, isMinimized: true } : window
    ))
  }

  const maximizeChatWindow = (id: string) => {
    setChatWindows(chatWindows.map(window => 
      window.id === id ? { ...window, isMinimized: false } : window
    ))
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WrapChatApp...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <div className="w-16 bg-slate-800 flex flex-col items-center py-4 space-y-4">
        {/* Logo */}
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant={activeView === 'home' ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setActiveView('home')}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeView === 'messages' ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setActiveView('messages')}
          >
            <Mail className="w-5 h-5" />
          </Button>
          
          <Button
            variant={activeView === 'rooms' ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setActiveView('rooms')}
          >
            <Users className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Bot className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Settings at bottom */}
        <div className="flex-1 flex flex-col justify-end">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">WrapChatApp</h1>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sign out
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Conversations/Rooms List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-gray-900">
                  {activeView === 'messages' ? 'Direct Messages' : 
                   activeView === 'rooms' ? 'Chat Rooms' : 'Overview'}
                </h2>
                {activeView !== 'home' && (
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Quick Actions for Home View */}
            {activeView === 'home' && (
              <div className="flex-1 p-4 space-y-3">
                <Link href="/messages">
                  <Card className="p-4 hover:bg-gray-50 cursor-pointer border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Direct Messages</h3>
                        <p className="text-sm text-gray-500">Private conversations</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/chat">
                  <Card className="p-4 hover:bg-gray-50 cursor-pointer border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Chat Rooms</h3>
                        <p className="text-sm text-gray-500">Public conversations</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Card 
                  className="p-4 hover:bg-gray-50 cursor-pointer border border-gray-200"
                  onClick={() => setIsAIAssistantOpen(true)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI Assistant</h3>
                      <p className="text-sm text-gray-500">Get instant help</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Messages/Rooms List */}
            {activeView !== 'home' && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 text-center text-gray-500 text-sm mt-8">
                  {activeView === 'messages' ? 'No direct messages yet' : 'No chat rooms joined'}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel - Chat Area */}
          <div className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to WrapChatApp
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Start a conversation by selecting a chat room or direct message from the sidebar, 
                or use the AI assistant for help.
              </p>
              <div className="flex justify-center space-x-3 mb-6">
                <Button onClick={() => setActiveView('messages')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Start Messaging
                </Button>
                <Button variant="outline" onClick={() => setIsAIAssistantOpen(true)}>
                  <Bot className="w-4 h-4 mr-2" />
                  Chat with AI
                </Button>
              </div>
              
              {/* Demo Window Buttons */}
              <div className="flex justify-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openChatWindow('John Doe', 'direct')}
                >
                  Demo DM Window
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openChatWindow('General Chat', 'room')}
                >
                  Demo Room Window
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openChatWindow('AI Assistant', 'ai')}
                >
                  Demo AI Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Chat Windows */}
      {chatWindows.map((window) => (
        <ResizableChatWindow
          key={window.id}
          id={window.id}
          title={window.title}
          type={window.type}
          initialPosition={window.position}
          isMinimized={window.isMinimized}
          onClose={() => closeChatWindow(window.id)}
          onMinimize={() => minimizeChatWindow(window.id)}
          onMaximize={() => maximizeChatWindow(window.id)}
        />
      ))}

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </div>
  )
}
