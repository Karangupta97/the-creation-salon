// Simple seed script using standard Prisma client (no Neon adapter)
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

// Set DATABASE_URL before creating Prisma client
process.env.DATABASE_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Seeding database with admin user...');

  // const adminEmail = 'admin@creationsalon.com';
  const adminEmail = 'karangupta3319@gmail.com';
  const adminPassword = 'CreationsalonAdmin@123!';
  const adminName = 'System Administrator';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${adminEmail} already exists. Skipping.`);
    return;
  }

  // Hash password
  const passwordHash = await hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: adminName,
      roles: ['admin'],
      isActive: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`Email: ${admin.email}`);
  console.log(`Name: ${admin.name}`);
  console.log(`ID: ${admin.id}`);
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
