import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        description: createTransactionDto.description,
        date: createTransactionDto.date,
        isRecurring: createTransactionDto.isRecurring,
        source: createTransactionDto.source,
        accountId: createTransactionDto.accountId,
        categoryId: createTransactionDto.categoryId, // Optional
      },
      include: {
        category: true, // Return the category details (color, icon)
        account: true,
      },
    });

    // 2. Update the Account Balance (Business Logic)
    const account = await this.prisma.account.findUnique({
      where: { id: createTransactionDto.accountId },
    });

    if (account) {
      // Logic: Balance + Transaction Amount
      // (Expenses are negative, so they subtract naturally)
      const newBalance = Number(account.balance) + createTransactionDto.amount;

      await this.prisma.account.update({
        where: { id: createTransactionDto.accountId },
        data: { balance: newBalance },
      });
    }

    return transaction;
  }

  findAll(start?: string, end?: string) {
    const where: any = {};

    // 1. Apply Date Filters if provided
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    // 2. Return list with Relations
    return this.prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true, // 👈 Include Category Data
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates #${id} transaction`;
  }

  async remove(id: string) {
    // 1. Find the transaction first
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // 2. Revert the Balance
    // If we delete an EXPENSE (-50), we must ADD 50 back.
    // If we delete an INCOME (+50), we must SUBTRACT 50.
    // Mathematically: Balance - TransactionAmount
    const account = await this.prisma.account.findUnique({
      where: { id: transaction.accountId },
    });

    if (account) {
      const reversedBalance =
        Number(account.balance) - Number(transaction.amount);
      await this.prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: reversedBalance },
      });
    }

    // 3. Delete the record
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
