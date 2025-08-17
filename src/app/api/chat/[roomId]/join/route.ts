import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.chatRoomMember.findUnique({
      where: {
        userId_chatRoomId: {
          userId: session.user.id,
          chatRoomId: roomId
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this room" },
        { status: 400 }
      )
    }

    // Add user to room
    const membership = await prisma.chatRoomMember.create({
      data: {
        userId: session.user.id,
        chatRoomId: roomId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        chatRoom: true
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove user from room
    await prisma.chatRoomMember.deleteMany({
      where: {
        userId: session.user.id,
        chatRoomId: roomId
      }
    })

    return NextResponse.json({ message: "Left room successfully" })
  } catch (error) {
    console.error("Error leaving room:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
