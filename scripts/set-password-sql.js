const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = process.argv[2];

  if (!password || password.length < 6) {
    console.error('Please provide a password as an argument');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('UPDATE users SET password = \'' + hashedPassword + '\' WHERE email = \'info@havanaelephantbrand.com\';');
}

hashPassword();
