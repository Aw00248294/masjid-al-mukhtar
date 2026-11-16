const bcrypt = require('bcryptjs');

async function generateAdminSQL() {
  const password = 'admin123';
  // Generate a secure bcrypt hash
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('✅ Hash generated successfully!\n');
  console.log('👇 COPY THE ENTIRE BLOCK BELOW AND PASTE IT INTO NEON SQL EDITOR:');
  console.log('=======================================================================');
  console.log(`INSERT INTO "Member" ("id", "name", "email", "password", "role", "createdAt")`);
  console.log(`VALUES ('admin-001-masjid', 'Masjid Admin', 'admin@mosque.com', '${hashedPassword}', 'admin', CURRENT_TIMESTAMP)`);
  console.log(`ON CONFLICT ("email") DO UPDATE SET "password" = '${hashedPassword}', "role" = 'admin';`);
  console.log('=======================================================================');
}

generateAdminSQL();