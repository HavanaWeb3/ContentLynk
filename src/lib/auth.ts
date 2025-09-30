import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string().min(6),
  displayName: z.string().optional(),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
        displayName: { label: 'Display Name', type: 'text' },
        isRegister: { label: 'Is Register', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if this is a registration attempt
          if (credentials.isRegister === 'true') {
            console.log('Registration attempt:', {
              email: credentials.email,
              username: credentials.username,
              displayName: credentials.displayName
            })

            const validatedData = registerSchema.parse({
              email: credentials.email,
              username: credentials.username,
              password: credentials.password,
              displayName: credentials.displayName,
            })

            console.log('Validation passed:', validatedData)

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: validatedData.email },
                  { username: validatedData.username },
                ],
              },
            })

            console.log('Existing user check:', existingUser)

            if (existingUser) {
              console.log('User already exists:', existingUser.email, existingUser.username)
              throw new Error('User already exists with this email or username')
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(validatedData.password, 12)

            // Create new user
            const user = await prisma.user.create({
              data: {
                email: validatedData.email,
                username: validatedData.username,
                displayName: validatedData.displayName || validatedData.username,
                // Note: We'll store password in a separate table for security
              },
            })

            // For now, return the user without storing password
            // In production, implement proper password storage
            return {
              id: user.id,
              email: user.email!,
              username: user.username,
              displayName: user.displayName || undefined,
            }
          } else {
            // Login attempt
            const validatedData = loginSchema.parse({
              email: credentials.email,
              password: credentials.password,
            })

            const user = await prisma.user.findUnique({
              where: { email: validatedData.email },
            })

            if (!user) {
              return null
            }

            // For MVP, we'll implement simple auth
            // In production, verify password hash
            return {
              id: user.id,
              email: user.email!,
              username: user.username,
              displayName: user.displayName || undefined,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
        token.displayName = user.displayName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username
        session.user.displayName = token.displayName
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    username?: string
    displayName?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      username?: string
      displayName?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string
    displayName?: string
  }
}