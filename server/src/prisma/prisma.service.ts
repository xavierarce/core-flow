import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. On crée un "Pool" de connexions (gestionnaire de trafic)
    const connectionString = `${process.env.DATABASE_URL}`;

    const pool = new Pool({
      connectionString,
      // Optionnel : configuration SSL pour la prod plus tard
    });

    // 2. On crée l'adaptateur Prisma 7
    const adapter = new PrismaPg(pool);

    // 3. On passe l'adaptateur au constructeur parent
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected with Prisma Adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
