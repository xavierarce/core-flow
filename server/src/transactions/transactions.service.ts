import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { accountId, ...data } = createTransactionDto;

    // 1. Save the Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        ...data,
        account: {
          connect: { id: accountId }, // Connect to the Account Table
        },
      },
    });

    // 2. Update the Account Balance (Business Logic)
    // We must find the current balance and add the new transaction amount
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (account) {
      // If amount is negative (expense), it naturally subtracts
      const newBalance = Number(account.balance) + data.amount;

      await this.prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });
    }

    return transaction;
  }

  findAll(start?: string, end?: string) {
    const where: any = {};

    if (start && end) {
      where.date = {
        gte: new Date(start), // Greater than or equal to Start Date
        lte: new Date(end), // Less than or equal to End Date
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates #${id} transaction`;
  }

  async remove(id: string) {
    // 1. Find the transaction first (we need the amount & accountId)
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
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
