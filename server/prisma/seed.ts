import { PrismaClient, AccountType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Clean DB
  try {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    console.log('🧹 Database cleared');
  } catch (e) {
    console.log('⚠️ First run, nothing to clear.');
  }

  // 2. Create Accounts
  // A. Investment Account (Growing wealth)
  const tradingAccount = await prisma.account.create({
    data: {
      name: 'Etoro',
      institution: 'EToro',
      balance: 2500.0, // Let's bump this up a bit ;)
      currency: 'USD',
      type: AccountType.INVESTMENT,
    },
  });

  // B. Main Checking Account (Daily Driver)
  const bank = await prisma.account.create({
    data: {
      name: 'Compte Courant',
      institution: 'Société Générale',
      balance: 4250.0, // Healthy buffer
      currency: 'EUR',
      type: AccountType.CASH,
    },
  });

  console.log('✅ Accounts created.');

  // 3. INJECT TRANSACTIONS

  // --- NOVEMBER (Previous Month) ---
  // Helps visualize trends in the Bar Chart

  // Income 💰
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 3200.0,
      description: 'Tech Corp Salary',
      category: 'Income',
      date: new Date('2023-11-28'),
      isRecurring: true,
    },
  });

  // Expenses 💸
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -850.0,
      description: 'Rent Paris 11e',
      category: 'Housing',
      date: new Date('2023-11-05'),
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -65.4,
      description: 'Carrefour Market',
      category: 'Food',
      date: new Date('2023-11-12'),
    },
  });

  // --- DECEMBER (Current Month) ---

  // Income 💰
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 3200.0,
      description: 'Tech Corp Salary',
      category: 'Income',
      date: new Date('2023-12-28'),
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 450.0,
      description: 'Freelance Frontend Mission',
      category: 'Side Hustle',
      date: new Date('2023-12-15'),
    },
  });

  // Expenses 💸
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -15.5,
      description: 'McDonalds Late Night',
      category: 'Food',
      date: new Date('2023-12-20'),
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -45.0,
      description: 'Uber Ride',
      category: 'Transport',
      date: new Date('2023-12-21'),
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -120.0,
      description: 'Christmas Gifts',
      category: 'Shopping',
      date: new Date('2023-12-23'),
    },
  });

  // Subscriptions 🔄
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -13.99,
      description: 'Netflix Premium',
      category: 'Entertainment',
      isRecurring: true,
      date: new Date('2023-12-01'),
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -22.0,
      description: 'ChatGPT Plus',
      category: 'Software',
      isRecurring: true,
      date: new Date('2023-12-02'),
    },
  });

  console.log('✅ Transactions injected (Nov & Dec).');
  console.log('🚀 Seeding finished.');
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
