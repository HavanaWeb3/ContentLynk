import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setAdminPassword() {
  try {
    console.log('🔐 Admin Password Setup\n')

    // Get admin email
    const email = await question('Enter admin email address: ')

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    // Find admin user
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

    // Get new password
    const password = await question('\nEnter new password (min 6 characters): ')

    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters')
      process.exit(1)
    }

    const confirmPassword = await question('Confirm password: ')

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    // Hash and update password
    console.log('\n🔄 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('💾 Updating database...')
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    console.log('\n✅ Password successfully set!')
    console.log(`\nYou can now sign in at https://www.contentlynk.com with:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: [the password you just set]`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

setAdminPassword()
