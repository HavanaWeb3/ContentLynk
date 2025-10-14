const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'info@havanaelephantbrand.com';
    const password = 'Everton7158!!!';

    console.log('🔍 Testing login for:', email);
    console.log('');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isAdmin: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Is Admin:', user.isAdmin);
    console.log('  Has Password:', !!user.password);
    console.log('');

    if (!user.password) {
      console.log('❌ No password set for this user');
      console.log('Run: npx tsx scripts/set-admin-password-direct.ts "YourPassword"');
      return;
    }

    console.log('🔐 Testing password verification...');
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ Password is VALID - login should work!');
    } else {
      console.log('❌ Password is INVALID');
      console.log('');
      console.log('Stored hash:', user.password.substring(0, 20) + '...');
      console.log('Testing with password:', password);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
