import { PrismaClient, AccountType, TransactionSource } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 👇👇👇 PASTE YOUR REAL CLERK ID HERE 👇👇👇
// (Find it in Clerk Dashboard > Users > Select your user > ID is at the top)
const MY_CLERK_ID = 'user_38IgHNJc4I5gDlwvYaj8Hm5JuUf';

async function main() {
  console.log(`🌱 Start seeding for Clerk ID: ${MY_CLERK_ID}...`);

  // 1. Clean DB (Delete everything to start fresh)
  try {
    console.log('🧹 Cleaning database...');
    // We delete data ONLY for this user (safest approach)
    // or delete global if you are in dev mode.
    // Let's wipe everything to be clean for dev.
    await prisma.categoryRule.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('⚠️ Cleanup warning:', e);
  }

  // 2. Create the User (Linked to your Real Clerk Account) 👤
  console.log('👤 Creating User...');
  const user = await prisma.user.create({
    data: {
      email: 'my_seed_email@xac.com', // Placeholder, Clerk holds the real one
      clerkId: MY_CLERK_ID,
    },
  });

  // 3. Create Categories (So your charts work!) 🏷️
  console.log('🏷️ Creating Categories...');

  // Helper to create category easily
  const createCat = (
    name: string,
    type: 'INCOME' | 'EXPENSE',
    color: string,
    icon: string,
  ) =>
    prisma.category.create({
      data: { name, type, color, icon, userId: user.id },
    });

  const salaryCat = await createCat('Salary', 'INCOME', '#10b981', 'wallet');
  const foodCat = await createCat('Food', 'EXPENSE', '#f59e0b', 'utensils');
  const housingCat = await createCat('Housing', 'EXPENSE', '#f43f5e', 'home');
  const techCat = await createCat('Tech', 'EXPENSE', '#3b82f6', 'laptop');
  const investCat = await createCat(
    'Investments',
    'EXPENSE',
    '#0ea5e9',
    'trending-up',
  );

  // 4. Create Accounts 🏦
  console.log('🏦 Creating Accounts...');

  const bank = await prisma.account.create({
    data: {
      name: 'Société Générale',
      institution: 'Bank',
      balance: 4250.0,
      currency: 'EUR',
      type: AccountType.CASH,
      userId: user.id,
    },
  });

  const tradingAccount = await prisma.account.create({
    data: {
      name: 'Etoro Portfolio',
      institution: 'EToro',
      balance: 12500.0,
      currency: 'USD',
      type: AccountType.INVESTMENT,
      userId: user.id,
    },
  });

  // 5. INJECT TRANSACTIONS (Linked to Categories!) 🧾
  console.log('🧾 Injecting Transactions...');

  // Helper for clean transaction creation
  const createTx = (
    desc: string,
    amount: number,
    date: string,
    accountId: string,
    categoryId?: string,
    isRecurring = false,
  ) =>
    prisma.transaction.create({
      data: {
        accountId,
        userId: user.id,
        amount,
        description: desc,
        date: new Date(date),
        source: TransactionSource.MANUAL,
        isRecurring,
        categoryId, // 👈 KEY: Link to category
      },
    });

  // Income
  await createTx(
    'Tech Corp Salary',
    3200.0,
    '2025-10-28',
    bank.id,
    salaryCat.id,
    true,
  );
  await createTx(
    'Tech Corp Salary',
    3200.0,
    '2025-11-28',
    bank.id,
    salaryCat.id,
    true,
  );

  // Expenses
  await createTx(
    'Rent Paris 11e',
    -1250.0,
    '2025-11-05',
    bank.id,
    housingCat.id,
    true,
  );
  await createTx(
    'McDonalds Late Night',
    -15.5,
    '2025-12-20',
    bank.id,
    foodCat.id,
  );
  await createTx(
    'Carrefour Groceries',
    -85.2,
    '2025-12-15',
    bank.id,
    foodCat.id,
  );
  await createTx(
    'ChatGPT Plus',
    -22.0,
    '2025-12-02',
    bank.id,
    techCat.id,
    true,
  );

  // Investments
  await createTx(
    'LEVIS Stock Purchase',
    -2000.0,
    '2025-12-20',
    tradingAccount.id,
    investCat.id,
  );
  await createTx(
    'Apple Dividend',
    150.0,
    '2025-12-25',
    tradingAccount.id,
    investCat.id,
  ); // Dividend is "negative expense" or separate income, depends on your logic.

  console.log('✅ Transactions injected.');
  console.log(`🚀 Seeding finished. Log in with your Clerk user to see data!`);
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
