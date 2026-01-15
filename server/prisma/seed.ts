import { PrismaClient, AccountType, TransactionSource } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Clean DB (Order matters because of Foreign Keys!)
  try {
    await prisma.categoryRule.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany(); // 👈 Delete users last (parents)
    console.log('🧹 Database cleared');
  } catch (e) {
    console.log('⚠️ Cleanup failed (or first run):', e);
  }

  // 2. Create the MASTER USER 👤
  console.log('👤 Creating Demo User...');
  const user = await prisma.user.create({
    data: {
      email: 'demo@xaccapital.com',
      // 👇 TRICK: If you want to see this data, replace this ID
      // with your REAL Clerk ID after you log in!
      clerkId: 'user_demo_123456',
    },
  });

  // 4. Create Accounts 🏦
  console.log('🏦 Creating Accounts...');

  const bank = await prisma.account.create({
    data: {
      name: 'Compte Courant',
      institution: 'Société Générale',
      balance: 4250.0,
      currency: 'EUR',
      type: AccountType.CASH,
      userId: user.id, // 👈 Link to User
    },
  });

  const tradingAccount = await prisma.account.create({
    data: {
      name: 'Etoro',
      institution: 'EToro',
      balance: 2500.0,
      currency: 'USD',
      type: AccountType.INVESTMENT,
      userId: user.id, // 👈 Link to User
    },
  });

  // 5. INJECT TRANSACTIONS 🧾
  console.log('🧾 Injecting Transactions...');

  await prisma.transaction.create({
    data: {
      accountId: tradingAccount.id,
      userId: user.id, // 👈 Link to User
      amount: -2000.0,
      description: 'LEVIS Stock',
      date: new Date('2025-12-20'),
      source: TransactionSource.MANUAL,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      userId: user.id, // 👈 Link to User
      amount: 3200.0,
      description: 'Tech Corp Salary',
      date: new Date('2025-10-28'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      userId: user.id, // 👈 Link to User
      amount: -850.0,
      description: 'Rent Paris 11e',
      date: new Date('2025-10-05'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      userId: user.id, // 👈 Link to User
      amount: -15.5,
      description: 'McDonalds Late Night',
      date: new Date('2025-12-20'),
      source: TransactionSource.BANK,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      userId: user.id, // 👈 Link to User
      amount: -22.0,
      description: 'ChatGPT Plus',
      isRecurring: true,
      date: new Date('2025-12-02'),
      source: TransactionSource.BANK,
    },
  });

  console.log('✅ Transactions injected.');
  console.log('🚀 Seeding finished. User ID:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
