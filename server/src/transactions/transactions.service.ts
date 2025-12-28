import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionSource } from '@prisma/client';

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
        categoryId: createTransactionDto.categoryId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Update Balance
    const account = await this.prisma.account.findUnique({
      where: { id: createTransactionDto.accountId },
    });

    if (account) {
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
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }
    return this.prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  // 👇 UPDATED: Now learns from your manual edits!
  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const { accountId, categoryId, amount, ...data } = updateTransactionDto;

    // 1. Perform the update
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(categoryId && {
          category: { connect: { id: categoryId } },
        }),
      },
      include: { category: true },
    });

    // 2. THE LEARNING LOGIC 🧠
    // If you categorized it, try to save a rule for next time
    if (categoryId && transaction.description) {
      // Logic: Take the first word (e.g. "Starbucks")
      const keyword = transaction.description
        .split(' ')[0]
        .toLowerCase()
        .trim();

      if (keyword.length > 3) {
        await this.prisma.categoryRule
          .upsert({
            where: { keyword },
            update: { categoryId },
            create: { keyword, categoryId },
          })
          .catch((e) => console.log('⚠️ Could not learn rule:', e.message));

        console.log(
          `🧠 Learned rule: "${keyword}" -> ${transaction.category?.name}`,
        );
      }
    }

    return transaction;
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

  // 👇 UPDATED: Fully Typed & Smart
  async import(accountId: string, transactions: any[]) {
    // 1. Fetch Rules & "Other" Category from DB
    const [rules, otherCategory] = await Promise.all([
      this.prisma.categoryRule.findMany(),
      this.prisma.category.findUnique({ where: { name: 'Other' } }),
    ]);

    // Create a Map for fast lookup
    const ruleMap = new Map(rules.map((r) => [r.keyword, r.categoryId]));

    // 2. Process Transactions
    const dataToInsert = transactions.map((tx) => {
      // ✅ FIX 1: Explicit Type
      let matchedCategoryId: string | null = null;
      const descLower = tx.description.toLowerCase();

      // Check against DB rules
      for (const [keyword, catId] of ruleMap.entries()) {
        if (descLower.includes(keyword)) {
          matchedCategoryId = catId;
          break;
        }
      }

      // Fallback to "Other" if no match found
      if (!matchedCategoryId && otherCategory) {
        matchedCategoryId = otherCategory.id;
      }

      return {
        description: tx.description,
        amount: tx.amount,
        date: new Date(tx.date),
        accountId: accountId,
        // ✅ FIX 2: Use Enum, not string
        source: TransactionSource.BANK,
        categoryId: matchedCategoryId,
      };
    });

    // 3. Calculate total for balance update
    const totalAmount = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );

    // 4. Save everything
    return this.prisma.$transaction([
      this.prisma.transaction.createMany({
        data: dataToInsert,
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: totalAmount },
        },
      }),
    ]);
  }
}
