import { PrismaClient, AccountType, TransactionSource } from '@prisma/client';
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
    await prisma.category.deleteMany();
  } catch (e) {
    console.log('⚠️ First run, nothing to clear.');
  }

  // 2. Create Categories 🎨
  console.log('🎨 Creating Categories...');

  // Income
  const catSalary = await prisma.category.create({
    data: { name: 'Salary', type: 'INCOME', color: '#10b981', icon: 'wallet' },
  }); // Emerald
  const catSideHustle = await prisma.category.create({
    data: {
      name: 'Side Hustle',
      type: 'INCOME',
      color: '#34d399',
      icon: 'briefcase',
    },
  });

  // Expenses
  const catHousing = await prisma.category.create({
    data: { name: 'Housing', type: 'EXPENSE', color: '#f43f5e', icon: 'home' },
  }); // Rose
  const catFood = await prisma.category.create({
    data: { name: 'Food', type: 'EXPENSE', color: '#f59e0b', icon: 'utensils' },
  }); // Amber
  const catTransport = await prisma.category.create({
    data: { name: 'Transport', type: 'EXPENSE', color: '#3b82f6', icon: 'car' },
  }); // Blue
  const catShopping = await prisma.category.create({
    data: {
      name: 'Shopping',
      type: 'EXPENSE',
      color: '#ec4899',
      icon: 'shopping-bag',
    },
  }); // Pink
  const catEntertainment = await prisma.category.create({
    data: {
      name: 'Entertainment',
      type: 'EXPENSE',
      color: '#8b5cf6',
      icon: 'tv',
    },
  }); // Violet
  const catSoftware = await prisma.category.create({
    data: { name: 'Software', type: 'EXPENSE', color: '#64748b', icon: 'cpu' },
  }); // Slate

  const catInvesting = await prisma.category.create({
    data: {
      name: 'Investing',
      type: 'EXPENSE', // It's money leaving your cash balance
      color: '#0ea5e9', // Sky Blue
      icon: 'trending-up',
    },
  });

  console.log('✅ Categories created.');

  // 3. Create Accounts
  // A. Investment Account
  const tradingAccount = await prisma.account.create({
    data: {
      name: 'Etoro',
      institution: 'EToro',
      balance: 2500.0,
      currency: 'USD',
      type: AccountType.INVESTMENT,
    },
  });

  // B. Main Checking Account
  const bank = await prisma.account.create({
    data: {
      name: 'Compte Courant',
      institution: 'Société Générale',
      balance: 4250.0,
      currency: 'EUR',
      type: AccountType.CASH,
    },
  });

  console.log('✅ Accounts created.');

  // 4. INJECT TRANSACTIONS

  // --- October ---
  await prisma.transaction.create({
    data: {
      accountId: tradingAccount.id,
      amount: -2000.0,
      description: 'LEVIS Stock', // Clarified description
      categoryId: catInvesting.id, // <--- Linked to new category
      date: new Date('2025-12-20'),
      source: TransactionSource.BANK, // Changed from BANK to MANUAL since it's a seed
      isRecurring: false, // Stock purchases are rarely recurring in the same way subscriptions are
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 3200.0,
      description: 'Tech Corp Salary',
      categoryId: catSalary.id, // 👈 Link to Category ID
      date: new Date('2025-10-28'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -850.0,
      description: 'Rent Paris 11e',
      categoryId: catHousing.id,
      date: new Date('2025-10-05'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -100.54,
      description: 'Justine Anniversaire',
      categoryId: catFood.id, // Using Food for birthday dinner
      date: new Date('2025-10-12'),
      source: TransactionSource.BANK,
    },
  });

  // --- NOVEMBER ---
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 3200.0,
      description: 'Tech Corp Salary',
      categoryId: catSalary.id,
      date: new Date('2025-11-28'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -850.0,
      description: 'Rent Paris 11e',
      categoryId: catHousing.id,
      date: new Date('2025-11-05'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -65.4,
      description: 'Carrefour Market',
      categoryId: catFood.id,
      date: new Date('2025-11-12'),
      source: TransactionSource.BANK,
    },
  });

  // --- DECEMBER ---
  // Income
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 3200.0,
      description: 'Tech Corp Salary',
      categoryId: catSalary.id,
      date: new Date('2025-12-28'),
      source: TransactionSource.BANK,
      isRecurring: true,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: 450.0,
      description: 'Freelance Frontend Mission',
      categoryId: catSideHustle.id,
      date: new Date('2025-12-15'),
      source: TransactionSource.BANK,
    },
  });

  // Expenses
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -15.5,
      description: 'McDonalds Late Night',
      categoryId: catFood.id,
      date: new Date('2025-12-20'),
      source: TransactionSource.BANK,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -45.0,
      description: 'Uber Ride',
      categoryId: catTransport.id,
      date: new Date('2025-12-21'),
      source: TransactionSource.BANK,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -120.0,
      description: 'Christmas Gifts',
      categoryId: catShopping.id,
      date: new Date('2025-12-23'),
      source: TransactionSource.BANK,
    },
  });

  // Subscriptions
  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -13.99,
      description: 'Netflix Premium',
      categoryId: catEntertainment.id,
      isRecurring: true,
      date: new Date('2025-12-01'),
      source: TransactionSource.BANK,
    },
  });

  await prisma.transaction.create({
    data: {
      accountId: bank.id,
      amount: -22.0,
      description: 'ChatGPT Plus',
      categoryId: catSoftware.id,
      isRecurring: true,
      date: new Date('2025-12-02'),
      source: TransactionSource.BANK,
    },
  });

  console.log('✅ Transactions injected (Oct, Nov & Dec).');
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
