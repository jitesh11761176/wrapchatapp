"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, BookOpen, Users, ArrowRight } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              WrapChatApp
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A complete chat platform with AI assistance and real-time collaboration features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="text-lg px-8 py-3">
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Smart Chat Rooms</CardTitle>
                <CardDescription>
                  Real-time messaging with AI assistance, emoji support, and GIF integration
                </CardDescription>
              </CardHeader>
            </Card>


            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Admin and user roles with tailored dashboards and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Built with Modern Technology</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-white px-4 py-2 rounded-full shadow">Next.js 14</span>
              <span className="bg-white px-4 py-2 rounded-full shadow">TypeScript</span>
              <span className="bg-white px-4 py-2 rounded-full shadow">Tailwind CSS</span>
              <span className="bg-white px-4 py-2 rounded-full shadow">Prisma</span>
              <span className="bg-white px-4 py-2 rounded-full shadow">NextAuth</span>
              <span className="bg-white px-4 py-2 rounded-full shadow">Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
