# WrapChatApp - Complete Learning Platform

A production-ready chat and learning platform built with Next.js 14, featuring real-time chat, AI assistance, course management, and role-based access control.

## 🚀 Features

### Authentication & Authorization
- ✅ Google OAuth integration
- ✅ Credentials-based authentication
- ✅ Role-based access control (Admin/Teacher/Student)
- ✅ Protected routes with NextAuth middleware

### Chat System
- ✅ Real-time chat rooms with 3-second polling
- ✅ AI assistant integration (Gemini API)
- ✅ Message types: Text, AI, Emoji, GIF
- ✅ Room creation, joining, and leaving
- ✅ Member management

### Course Management
- ✅ CRUD operations for courses
- ✅ AI-powered content generation
- ✅ Student enrollment system
- ✅ Progress tracking
- ✅ Role-based course access

### Dashboard Features
- ✅ Personalized dashboards by role
- ✅ Course progress visualization
- ✅ User management (Admin/Teacher)
- ✅ Activity tracking

## 🛠 Tech Stack

- **Frontend:** Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI primitives
- **Authentication:** NextAuth.js with Prisma adapter
- **Database:** PostgreSQL with Prisma ORM
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React
- **Styling:** Tailwind CSS with CSS variables

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- Google OAuth credentials
- Gemini API key
- GIPHY API key (optional)

## ⚙️ Installation

1. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

2. **Environment setup**
```bash
cp .env.example .env.local
```

3. **Configure environment variables**
Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wrapchatapp"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI (Get from Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# GIPHY (Optional - Get from GIPHY Developers)
GIPHY_API_KEY="your-giphy-api-key"

# App
APP_BASE_URL="http://localhost:3000"
```

4. **Database setup**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio
npx prisma studio
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 Getting API Keys

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Add authorized origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local`

### GIPHY API (Optional)
1. Go to [GIPHY Developers](https://developers.giphy.com/)
2. Create an account and new app
3. Get your API key

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import project to Vercel**
3. **Configure environment variables** in Vercel dashboard
4. **Set up database** (Neon, Supabase, or PlanetScale recommended)
5. **Deploy**

### Environment Variables for Production
Remember to update these for production:
- `NEXTAUTH_URL` → Your production domain
- `DATABASE_URL` → Production database URL
- `APP_BASE_URL` → Your production domain

## 🎯 User Roles & Permissions

### Student
- Join chat rooms
- Send messages and interact with AI
- Enroll in courses
- View progress
- Access course materials

### Teacher  
- All student permissions
- Create and manage courses
- View student progress
- Generate AI course content
- Manage enrolled students

### Admin
- All teacher permissions
- User management
- Role assignments
- System administration

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
```
