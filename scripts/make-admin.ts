import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    console.log('✅ User is now an admin!')
    console.log('Email:', user.email)
    console.log('Username:', user.username)
    console.log('Admin:', user.isAdmin)
  } catch (error) {
    console.error('❌ Error making user admin:', error)
    console.log('\nMake sure the user exists in the database.')
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npm run make-admin your@email.com')
  process.exit(1)
}

makeAdmin(email)
