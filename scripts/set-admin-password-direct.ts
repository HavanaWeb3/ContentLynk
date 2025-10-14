import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setAdminPassword() {
  try {
    const email = 'info@havanaelephantbrand.com'
    const password = process.argv[2]

    if (!password || password.length < 6) {
      console.error('❌ Please provide a password (min 6 characters) as an argument')
      console.error('Usage: npx tsx scripts/set-admin-password-direct.ts YOUR_PASSWORD')
      process.exit(1)
    }

    console.log(`🔍 Finding admin user: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ No user found with email: ${email}`)
      process.exit(1)
    }

    if (!user.isAdmin) {
      console.error(`❌ User ${email} is not an admin`)
      process.exit(1)
    }

    console.log(`✅ Found admin user: ${user.username} (${user.email})`)
    console.log('🔄 Hashing password...')

    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('💾 Updating database...')
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    console.log('\n✅ Password successfully set!')
    console.log(`\nYou can now sign in at https://www.contentlynk.com with:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: [the password you just provided]`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()
