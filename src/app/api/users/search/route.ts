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

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    
    if (query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    const currentUserId = session.user.id

    // Search users by name or email, excluding current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: currentUserId
            }
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 10 // Limit results
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
}
