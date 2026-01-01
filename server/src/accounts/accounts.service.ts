import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { GetAccountsQueryDto } from 'src/transactions/dto/get-transaction.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Account (With optional initial balance transaction)
  async create(dto: CreateAccountDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Account
      const account = await tx.account.create({
        data: {
          name: dto.name,
          institution: dto.institution,
          type: dto.type,
          // 👇 MAPPING: Input 'initialBalance' -> Database 'balance'
          balance: dto.initialBalance || 0,
          isAutomated: false,
        },
      });

      // 2. Create Transaction History
      if (dto.initialBalance && dto.initialBalance !== 0) {
        await tx.transaction.create({
          data: {
            accountId: account.id,
            amount: dto.initialBalance,
            description: 'Initial Balance',
            date: new Date(),
            source: 'MANUAL',
          },
        });
      }

      return account;
    });
  }

  async findAll(start?: string, end?: string) {
    return this.prisma.account.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        transactions: {
          where: {
            date: {
              gte: start ? new Date(start) : undefined,
              lte: end ? new Date(end) : undefined,
            },
          },
          orderBy: { date: 'desc' },
          include: { category: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  // 2. Update Account
  async update(id: string, dto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  // ... imports

  // 3. Delete Account (And all its transactions)
  async remove(id: string) {
    // We use a transaction to ensure clean deletion
    return this.prisma.$transaction(async (tx) => {
      // A. Delete all transactions linked to this account
      await tx.transaction.deleteMany({
        where: { accountId: id },
      });

      // B. Delete any Assets linked to this account (Future proofing)
      // await tx.asset.deleteMany({ where: { accountId: id } }); // Uncomment in Sprint 2

      // C. Finally, delete the account itself
      return tx.account.delete({
        where: { id },
      });
    });
  }
}
