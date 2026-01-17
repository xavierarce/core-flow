import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Account (Now requires userId)
  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.$transaction(async (tx) => {
      // A. Create Account linked to User
      const account = await tx.account.create({
        data: {
          name: dto.name,
          institution: dto.institution,
          type: dto.type,
          balance: dto.initialBalance || 0,
          isAutomated: false,
          userId: userId, // 👈 KEY FIX: Link to User
        },
      });

      // B. Create Initial Transaction (if needed)
      if (dto.initialBalance && dto.initialBalance !== 0) {
        await tx.transaction.create({
          data: {
            accountId: account.id,
            userId: userId, // 👈 KEY FIX: Link to User
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

  // 2. Find All (Only for this user)
  async findAll(userId: string, start?: string, end?: string) {
    // 1. Build Transaction Filter
    const transactionWhere: any = {};

    if (start && end) {
      transactionWhere.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        transactions: {
          where: transactionWhere, // 👈 Apply Date Filter
          orderBy: { date: 'desc' },
          include: {
            category: true,
          },
          ...(start && end ? {} : { take: 5 }),
        },
      },
    });
  }

  // 3. Find One (Ensure ownership)
  async findOne(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId }, // 👈 Security Filter
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  // 4. Update
  async update(id: string, userId: string, dto: UpdateAccountDto) {
    // Check existence first
    await this.findOne(id, userId);

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  // 5. Remove
  async remove(id: string, userId: string) {
    // Check existence first
    await this.findOne(id, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { accountId: id } });
      return tx.account.delete({ where: { id } });
    });
  }
}
