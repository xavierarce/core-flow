import { PrismaClient, AccountType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Configuration de la connexion "Industrielle"
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // 2. Nettoyage de la base
  try {
    await prisma.account.deleteMany(); // On vide la table Accounts
    console.log('🧹 Database cleared');
  } catch (e) {
    // On ignore l'erreur si la table n'existe pas encore (premier run)
    console.log('⚠️ No data to clear or table issue');
  }

  // 3. Création du Compte Trading
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

  // 4. Création du Fonds d'Urgence
  const savingsAccount = await prisma.account.create({
    data: {
      name: 'Livret A / LEP',
      institution: 'SG Bank',
      balance: 4000.0,
      currency: 'EUR',
      type: AccountType.SAVINGS,
    },
  });
  console.log(
    `✅ Created: ${savingsAccount.name} (€${savingsAccount.balance})`,
  );

  console.log('🚀 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Important: On ferme aussi le pool de connexion du script
    await pool.end();
  });
