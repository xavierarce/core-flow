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

  findAll() {
    return this.prisma.transaction.findMany({
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
  remove(id: number) {
    return `This action removes #${id} transaction`;
  }
}
