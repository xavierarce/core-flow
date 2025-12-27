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
    await prisma.transaction.deleteMany(); // Delete transactions first (foreign key)
    await prisma.account.deleteMany();
    console.log('🧹 Database cleared');
  } catch (e) {
    console.log('⚠️ First run, nothing to clear.');
  }

  // 2. Create Trading Account
  const tradingAccount = await prisma.account.create({
    data: {
      name: 'Interactive Brokers',
      institution: 'IBKR',
      balance: 2500.0,
      currency: 'USD',
      type: AccountType.INVESTMENT,
    },
  });
  console.log(
    `✅ Created: ${tradingAccount.name} ($${tradingAccount.balance})`,
  );

  // 3. Create Main Bank Account
  const bank = await prisma.account.create({
    data: {
      name: 'Compte Courant',
      institution: 'Société Générale',
      balance: 1250.0,
      currency: 'EUR',
      type: AccountType.CASH,
    },
  });

  console.log('✅ Accounts created.');

  // 4. INJECT TRANSACTIONS (The fun part)

  // A. Wasted Money (The "Wants")
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -15.5,
      description: 'McDonalds Paris',
      category: 'Food',
      date: new Date('2023-12-20'),
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -45.0,
      description: 'Uber Ride Night',
      category: 'Transport',
      date: new Date('2023-12-21'),
    },
  });

  // B. The "Subscription" (Recurring)
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -13.99,
      description: 'Netflix Premium',
      category: 'Entertainment',
      isRecurring: true, // <--- This allows us to track it!
      date: new Date('2023-12-01'),
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -29.99,
      description: 'ChatGPT Plus',
      category: 'Software',
      isRecurring: true,
      date: new Date('2023-12-02'),
    },
  });

  console.log('✅ Transactions injected.');
  console.log('🚀 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Closing connexion pool');
    await pool.end();
  });
