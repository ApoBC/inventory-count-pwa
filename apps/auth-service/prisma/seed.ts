import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const hashedPassword = await bcryptjs.hash('pass123', 10);

  // Clear existing users
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Create operators
  const operators = await Promise.all([
    prisma.user.create({
      data: {
        id: 'USR-OP-001',
        username: 'OP001',
        email: 'op001@inventory.local',
        password: hashedPassword,
        role: 'OPERATOR',
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 'USR-OP-002',
        username: 'OP002',
        email: 'op002@inventory.local',
        password: hashedPassword,
        role: 'OPERATOR',
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 'USR-OP-003',
        username: 'OP003',
        email: 'op003@inventory.local',
        password: hashedPassword,
        role: 'OPERATOR',
        active: true,
      },
    }),
  ]);

  // Create supervisors
  const supervisors = await Promise.all([
    prisma.user.create({
      data: {
        id: 'USR-SV-001',
        username: 'SV001',
        email: 'sv001@inventory.local',
        password: hashedPassword,
        role: 'SUPERVISOR',
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 'USR-SV-002',
        username: 'SV002',
        email: 'sv002@inventory.local',
        password: hashedPassword,
        role: 'SUPERVISOR',
        active: true,
      },
    }),
  ]);

  console.log('✅ Created users:');
  console.log('Operators:', operators.map(u => u.username));
  console.log('Supervisors:', supervisors.map(u => u.username));
  console.log('Password: pass123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
