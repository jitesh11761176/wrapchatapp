import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
if (!session) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

// Check if Gemini API key is configured
if (!process.env.GEMINI_API_KEY) {
return NextResponse.json({ 
error: "AI service is not properly configured. Please check API key settings." 
}, { status: 500 })
}

const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Create chat with history if provided
    let chat
    if (history && history.length > 0) {
      chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      })
    } else {
      chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      })
    }

    // Add system context to make the AI more helpful
    const contextualMessage = `You are a helpful AI assistant in a chat application called WrapChatApp. 
    Please provide helpful, accurate, and friendly responses. Keep your responses concise but informative.
    
    User message: ${message}`

    const result = await chat.sendMessage(contextualMessage)
    const response = result.response.text()

    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("AI Assistant API Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get AI response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
