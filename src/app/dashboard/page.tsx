"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, BookOpen, Users, Settings } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">WrapChatApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name || session.user.email}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                {session.user.role?.toLowerCase()}
              </span>
              <Button onClick={() => signOut()} variant="outline">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Rooms */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Chat Rooms</span>
              </CardTitle>
              <CardDescription>
                Join conversations and chat with AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full">Enter Chat</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Courses */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Courses</span>
              </CardTitle>
              <CardDescription>
                {session.user.role === "STUDENT" 
                  ? "View and track your enrolled courses"
                  : "Manage and create courses"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/courses">
                <Button className="w-full">View Courses</Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Management (Admin/Teacher only) */}
          {(session.user.role === "ADMIN" || session.user.role === "TEACHER") && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </CardTitle>
                <CardDescription>
                  {session.user.role === "ADMIN" 
                    ? "Manage users and roles"
                    : "View enrolled students"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
              <CardDescription>
                Update your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full" variant="outline">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                No recent activity to show.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
