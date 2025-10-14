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
  // Note: Cannot use adapter with CredentialsProvider
  // adapter: PrismaAdapter(prisma),
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

            // Create new user with hashed password
            const user = await prisma.user.create({
              data: {
                email: validatedData.email,
                username: validatedData.username,
                displayName: validatedData.displayName || validatedData.username,
                password: hashedPassword,
              },
            })

            return {
              id: user.id,
              email: user.email!,
              username: user.username,
              displayName: user.displayName || undefined,
              isAdmin: user.isAdmin,
            }
          } else {
            // Login attempt
            console.log('Login attempt for:', credentials.email)

            const validatedData = loginSchema.parse({
              email: credentials.email,
              password: credentials.password,
            })

            const user = await prisma.user.findUnique({
              where: { email: validatedData.email },
            })

            console.log('User found:', !!user)
            console.log('User has password:', !!user?.password)

            if (!user || !user.password) {
              console.log('Login failed: No user or no password')
              return null
            }

            // Verify password hash
            const isPasswordValid = await bcrypt.compare(
              validatedData.password,
              user.password
            )

            console.log('Password valid:', isPasswordValid)

            if (!isPasswordValid) {
              console.log('Login failed: Invalid password')
              return null
            }

            console.log('Login successful for:', user.email)
            return {
              id: user.id,
              email: user.email!,
              username: user.username,
              displayName: user.displayName || undefined,
              isAdmin: user.isAdmin,
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
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username
        session.user.displayName = token.displayName
        session.user.isAdmin = token.isAdmin
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
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      username?: string
      displayName?: string
      isAdmin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string
    displayName?: string
    isAdmin?: boolean
  }
}