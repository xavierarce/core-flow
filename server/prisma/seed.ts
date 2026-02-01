import { PrismaClient, AccountType, TransactionSource } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 👇 CONFIGURATION
const MY_CLERK_ID = 'user_38IgHNJc4I5gDlwvYaj8Hm5JuUf';
const HISTORY_MONTHS = 4;
const SALARY_AMOUNT = 3200;
const RENT_AMOUNT = 1250;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- SMART HELPERS 🧠 ---

const randomAmount = (min: number, max: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(2));
};

// Returns date if it is in the past, otherwise null (skips future bills)
const getPastDateInMonth = (monthOffset: number, day: number) => {
  const now = new Date();
  const targetDate = new Date();

  // Go back 'monthOffset' months
  targetDate.setMonth(now.getMonth() - monthOffset);
  targetDate.setDate(day);

  // 🛑 SAFETY CHECK: If target is in the future, return null
  if (targetDate > now) return null;

  return targetDate;
};

// Returns a random date, but capped at "Today" if it's the current month
const getRandomPastDateInMonth = (monthOffset: number) => {
  const now = new Date();
  const date = new Date();

  date.setMonth(now.getMonth() - monthOffset);

  // Find the max valid day for this month
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  let maxDay = daysInMonth;

  // 🛑 SAFETY CHECK: If it's the current month, cap at today!
  if (monthOffset === 0) {
    maxDay = now.getDate();
  }

  const randomDay = Math.floor(Math.random() * maxDay) + 1;
  date.setDate(randomDay);

  return date;
};

async function main() {
  console.log(`🌱 Starting Reality-Check Seed for: ${MY_CLERK_ID}`);

  try {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('⚠️ DB clean.');
  }

  const user = await prisma.user.create({
    data: { email: 'demo@xaccapital.com', clerkId: MY_CLERK_ID },
  });

  // Create Categories
  const catData = [
    { key: 'Salary', type: 'INCOME', color: '#10b981', icon: 'wallet' },
    { key: 'Housing', type: 'EXPENSE', color: '#f43f5e', icon: 'home' },
    { key: 'Food', type: 'EXPENSE', color: '#f59e0b', icon: 'utensils' },
    { key: 'Transport', type: 'EXPENSE', color: '#8b5cf6', icon: 'car' },
    {
      key: 'Shopping',
      type: 'EXPENSE',
      color: '#ec4899',
      icon: 'shopping-bag',
    },
    { key: 'Tech', type: 'EXPENSE', color: '#3b82f6', icon: 'laptop' },
    {
      key: 'Investments',
      type: 'EXPENSE',
      color: '#0ea5e9',
      icon: 'trending-up',
    },
  ] as const;

  const cats: Record<string, string> = {};
  for (const c of catData) {
    const res = await prisma.category.create({
      data: {
        name: c.key,
        type: c.type as any,
        color: c.color,
        icon: c.icon,
        userId: user.id,
      },
    });
    cats[c.key] = res.id;
  }

  const bank = await prisma.account.create({
    data: {
      name: 'Société Générale',
      institution: 'Bank',
      balance: 0,
      currency: 'EUR',
      type: AccountType.CASH,
      userId: user.id,
    },
  });

  const trading = await prisma.account.create({
    data: {
      name: 'Etoro',
      institution: 'Investment',
      balance: 15000,
      currency: 'USD',
      type: AccountType.INVESTMENT,
      userId: user.id,
    },
  });

  // --- GENERATOR ---
  console.log(`🧾 Generating history...`);
  const transactionsToCreate: any[] = [];
  let currentBalance = 0;

  for (let i = HISTORY_MONTHS; i >= 0; i--) {
    // A. RECURRING (Skipped if date > today)
    const addRecurring = (
      desc: string,
      amount: number,
      day: number,
      catId: string,
      isIncome = false,
    ) => {
      const date = getPastDateInMonth(i, day);
      if (!date) return; // 👈 Skip future bills!

      transactionsToCreate.push({
        accountId: bank.id,
        userId: user.id,
        amount: isIncome ? amount : -amount,
        description: desc,
        date: date,
        source: TransactionSource.MANUAL,
        isRecurring: true,
        categoryId: catId,
      });
      currentBalance += isIncome ? amount : -amount;
    };

    addRecurring('Tech Corp Salary', SALARY_AMOUNT, 28, cats.Salary, true);
    addRecurring('Rent Paris', RENT_AMOUNT, 5, cats.Housing); // Will show for Feb 1st only if run after 5th
    addRecurring('Navigo Pass', 84.1, 2, cats.Transport); // Will show for Feb 1st
    addRecurring('Spotify Premium', 12.99, 15, cats.Tech);
    addRecurring('Internet Fiber', 39.99, 10, cats.Tech);

    // B. HABITS (Capped at today)
    const addHabit = (
      descOptions: string[],
      min: number,
      max: number,
      count: number,
      catId: string,
    ) => {
      // If it's the current month and today is the 1st, reduce count significantly
      // (You can't eat out 8 times in 1 day)
      let adjustedCount = count;
      if (i === 0)
        adjustedCount = Math.ceil((count / 30) * new Date().getDate());

      for (let j = 0; j < adjustedCount; j++) {
        const desc =
          descOptions[Math.floor(Math.random() * descOptions.length)];
        const amount = randomAmount(min, max);

        transactionsToCreate.push({
          accountId: bank.id,
          userId: user.id,
          amount: -amount,
          description: desc,
          date: getRandomPastDateInMonth(i), // 👈 Capped at today
          source: TransactionSource.MANUAL,
          isRecurring: false,
          categoryId: catId,
        });
        currentBalance -= amount;
      }
    };

    addHabit(
      ['Carrefour City', 'Monoprix', 'Bakery', 'Uber Eats', 'Restaurant'],
      15,
      80,
      8,
      cats.Food,
    );
    addHabit(['Amazon', 'Zara', 'FNAC', 'Uniqlo'], 30, 150, 2, cats.Shopping);
    addHabit(['Uber', 'Bolt', 'Train Ticket'], 10, 45, 3, cats.Transport);
  }

  // C. ONE-OFF
  // Investment happened last month, so it's safe
  transactionsToCreate.push({
    accountId: trading.id,
    userId: user.id,
    amount: -2000,
    description: 'NVIDIA Stock Buy',
    date: getPastDateInMonth(1, 15),
    categoryId: cats.Investments,
  });

  console.log(`💾 Saving ${transactionsToCreate.length} transactions...`);
  for (const tx of transactionsToCreate) {
    if (tx.date) await prisma.transaction.create({ data: tx }); // Check for null dates just in case
  }

  await prisma.account.update({
    where: { id: bank.id },
    data: { balance: parseFloat(currentBalance.toFixed(2)) },
  });

  console.log(`✅ Finished! Bank Balance: €${currentBalance.toFixed(2)}`);
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
