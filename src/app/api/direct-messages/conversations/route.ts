import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get all users that have had direct message conversations with current user
    const conversations = await prisma.user.findMany({
      where: {
        OR: [
          {
            sentDirectMessages: {
              some: {
                receiverId: userId
              }
            }
          },
          {
            receivedDirectMessages: {
              some: {
                senderId: userId
              }
            }
          }
        ],
        NOT: {
          id: userId // Exclude self
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        sentDirectMessages: {
          where: {
            receiverId: userId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            read: true
          }
        },
        receivedDirectMessages: {
          where: {
            senderId: userId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            read: true
          }
        }
      }
    })

    // Process conversations to get the latest message and unread count
    const processedConversations = await Promise.all(
      conversations.map(async (user) => {
        // Get the latest message between these two users
        const latestMessage = await prisma.directMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        })

        // Get unread message count
        const unreadCount = await prisma.directMessage.count({
          where: {
            senderId: user.id,
            receiverId: userId,
            read: false
          }
        })

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          },
          latestMessage,
          unreadCount
        }
      })
    )

    // Sort by latest message time
    processedConversations.sort((a, b) => {
      const timeA = a.latestMessage?.createdAt || new Date(0)
      const timeB = b.latestMessage?.createdAt || new Date(0)
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })

    return NextResponse.json(processedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
