import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionSource } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // 👇 NEW HELPER: Shared Learning Logic 🧠
  private async learnRule(description: string, categoryId: string) {
    if (!description || !categoryId) return;

    // Logic: Take the first word (e.g., "Starbucks")
    const keyword = description.split(' ')[0].toLowerCase().trim();

    // Only learn significant words (>3 chars)
    if (keyword.length > 3) {
      try {
        await this.prisma.categoryRule.upsert({
          where: { keyword },
          update: { categoryId },
          create: { keyword, categoryId },
        });

        // Fetch category name just for the console log (optional)
        const cat = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });
        console.log(`🧠 Learned rule: "${keyword}" -> ${cat?.name}`);
      } catch (e) {
        console.log('⚠️ Could not learn rule:', e.message);
      }
    }
  }

  async create(createTransactionDto: CreateTransactionDto) {
    let finalCategoryId = createTransactionDto.categoryId;

    // 1. SMART LOGIC ON CREATE 🧠
    if (finalCategoryId) {
      // Scenario A: User selected a category manually.
      // Action: Learn this preference for the future!
      await this.learnRule(createTransactionDto.description, finalCategoryId);
    } else {
      // Scenario B: User left category empty.
      // Action: Default to "Other" so it's not "Uncategorized" (null)
      const otherCategory = await this.prisma.category.findUnique({
        where: { name: 'Other' },
      });
      finalCategoryId = otherCategory?.id;
    }

    // 2. Save Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        description: createTransactionDto.description,
        date: createTransactionDto.date,
        isRecurring: createTransactionDto.isRecurring,
        source: createTransactionDto.source,
        accountId: createTransactionDto.accountId,
        categoryId: finalCategoryId, // 👈 Use the resolved ID
      },
      include: {
        category: true,
        account: true,
      },
    });

    // 3. Update Balance
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

    // 2. THE LEARNING LOGIC (Reused!) 🧠
    if (categoryId && transaction.description) {
      await this.learnRule(transaction.description, categoryId);
    }

    return transaction;
  }

  async remove(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Revert Balance
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

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async import(accountId: string, transactions: any[]) {
    // 1. Fetch Rules & "Other" Category from DB
    const [rules, otherCategory] = await Promise.all([
      this.prisma.categoryRule.findMany(),
      this.prisma.category.findUnique({ where: { name: 'Other' } }),
    ]);

    const ruleMap = new Map<string, string>(
      rules.map((r) => [r.keyword, r.categoryId]),
    );

    // 2. Process Transactions
    const dataToInsert = transactions.map((tx) => {
      let matchedCategoryId: string | null = null;
      const descLower = tx.description.toLowerCase();

      // Check against DB rules
      for (const [keyword, catId] of ruleMap.entries()) {
        if (descLower.includes(keyword)) {
          matchedCategoryId = catId;
          break;
        }
      }

      // Fallback to "Other"
      if (!matchedCategoryId && otherCategory) {
        matchedCategoryId = otherCategory.id;
      }

      return {
        description: tx.description,
        amount: tx.amount,
        date: new Date(tx.date),
        accountId: accountId,
        source: TransactionSource.BANK,
        categoryId: matchedCategoryId,
      };
    });

    const totalAmount = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );

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
