"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Minus, Maximize2, Minimize2, Send, User, Bot } from "lucide-react"

interface ChatWindowProps {
  id: string
  title: string
  type: "direct" | "room" | "ai"
  isMinimized?: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
}

export default function ResizableChatWindow({
  id,
  title,
  type,
  isMinimized = false,
  onClose,
  onMinimize,
  onMaximize,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 500 }
}: ChatWindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  
  const windowRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
      
      if (isResizing) {
        const rect = windowRef.current?.getBoundingClientRect()
        if (rect) {
          setSize({
            width: Math.max(300, e.clientX - rect.left),
            height: Math.max(200, e.clientY - rect.top)
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "ai":
        return <Bot className="w-4 h-4" />
      case "direct":
        return <User className="w-4 h-4" />
      case "room":
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case "ai":
        return "bg-purple-500"
      case "direct":
        return "bg-green-500"
      case "room":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow z-50"
        style={{ left: position.x }}
        onClick={onMaximize}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getTypeColor()}`} />
          <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
            {title}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: 300,
        minHeight: 200
      }}
    >
      {/* Window Header */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getTypeColor()}`} />
          {getTypeIcon()}
          <span className="font-medium text-gray-700 text-sm truncate max-w-48">
            {title}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onMinimize}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ height: size.height - 120 }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              {getTypeIcon()}
            </div>
            Start your conversation
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage()
              }
            }}
            className="flex-1 text-sm"
            size={undefined}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-3"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400" />
      </div>
    </div>
  )
}
