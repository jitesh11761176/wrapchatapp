import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    const messages = await prisma.message.findMany({
      where: {
        chatRoomId: params.roomId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      })
    })

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, type = "TEXT" } = await req.json()

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    // Check if user is member of the room
    const membership = await prisma.chatRoomMember.findUnique({
      where: {
        userId_chatRoomId: {
          userId: session.user.id,
          chatRoomId: params.roomId
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      )
    }

    // Create the user message
    const message = await prisma.message.create({
      data: {
        content,
        type,
        userId: session.user.id,
        chatRoomId: params.roomId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Update room's last activity
    await prisma.chatRoom.update({
      where: { id: params.roomId },
      data: { updatedAt: new Date() }
    })

    // Generate AI response if the message mentions AI or asks a question
    if (content.toLowerCase().includes("@ai") || content.includes("?")) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const prompt = `You are a helpful AI assistant in a chat room. Respond to this message: "${content}"`
        
        const result = await model.generateContent(prompt)
        const aiResponse = result.response.text()

        // Create AI message
        const aiMessage = await prisma.message.create({
          data: {
            content: aiResponse,
            type: "AI",
            userId: null, // AI messages don't have a user
            chatRoomId: params.roomId
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        })

        return NextResponse.json({
          userMessage: message,
          aiMessage
        }, { status: 201 })
      } catch (aiError) {
        console.error("Error generating AI response:", aiError)
        // Return just the user message if AI fails
        return NextResponse.json({ userMessage: message }, { status: 201 })
      }
    }

    return NextResponse.json({ userMessage: message }, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
