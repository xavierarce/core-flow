import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionSource } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // 👇 HELPER: Shared Learning Logic (Now Scoped to User 👤)
  private async learnRule(
    userId: string,
    description: string,
    categoryId: string,
  ) {
    if (!description || !categoryId) return;

    const keyword = description.split(' ')[0].toLowerCase().trim();

    // Only learn significant words
    if (keyword.length > 3) {
      try {
        await this.prisma.categoryRule.upsert({
          // 🔒 SaaS Fix: Use composite unique key (keyword + userId)
          where: {
            keyword_userId: { keyword, userId },
          },
          update: { categoryId },
          create: {
            keyword,
            categoryId,
            userId, // 👈 Link rule to user
          },
        });

        console.log(
          `🧠 Learned rule for User ${userId.slice(0, 4)}...: "${keyword}"`,
        );
      } catch (e) {
        console.log('⚠️ Could not learn rule:', e.message);
      }
    }
  }

  // 1. CREATE (With User Context)
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    let finalCategoryId = createTransactionDto.categoryId;

    // A. Smart Logic
    if (finalCategoryId) {
      // Learn user preference
      await this.learnRule(
        userId,
        createTransactionDto.description,
        finalCategoryId,
      );
    } else {
      // Find "Other" category for THIS user
      const otherCategory = await this.prisma.category.findUnique({
        where: {
          name_userId: { name: 'Other', userId }, // 🔒 SaaS Fix
        },
      });
      finalCategoryId = otherCategory?.id;
    }

    // B. Save Transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        description: createTransactionDto.description,
        date: createTransactionDto.date,
        isRecurring: createTransactionDto.isRecurring,
        source: createTransactionDto.source,
        accountId: createTransactionDto.accountId,
        categoryId: finalCategoryId,
        userId: userId, // 👈 KEY: Link to User
      },
      include: {
        category: true,
        account: true,
      },
    });

    // C. Update Balance (Securely)
    await this.prisma.account.update({
      where: { id: createTransactionDto.accountId, userId }, // 🔒 Verify ownership
      data: { balance: { increment: createTransactionDto.amount } },
    });

    return transaction;
  }

  // 2. FIND ALL (Filtered by User)
  findAll(userId: string, start?: string, end?: string) {
    const where: any = { userId }; // 🔒 Base filter

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

  // 3. FIND ONE
  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id, userId }, // 🔒 Ensure ownership
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  // 4. UPDATE
  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { accountId, categoryId, amount, ...data } = updateTransactionDto;

    // Check existence first
    await this.findOne(id, userId);

    // Perform Update
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

    // Re-trigger Learning
    if (categoryId && transaction.description) {
      await this.learnRule(userId, transaction.description, categoryId);
    }

    return transaction;
  }

  // 5. REMOVE
  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId); // 🔒 Checks ownership

    // Revert Balance
    await this.prisma.account.update({
      where: { id: transaction.accountId, userId }, // 🔒 Verify ownership
      data: { balance: { decrement: Number(transaction.amount) } },
    });

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  // 6. BULK IMPORT (SaaS Logic)
  async import(userId: string, accountId: string, transactions: any[]) {
    // A. Fetch rules ONLY for this user
    const [rules, otherCategory] = await Promise.all([
      this.prisma.categoryRule.findMany({ where: { userId } }),
      this.prisma.category.findUnique({
        where: { name_userId: { name: 'Other', userId } },
      }),
    ]);

    const ruleMap = new Map<string, string>(
      rules.map((r) => [r.keyword, r.categoryId]),
    );

    // B. Process Data
    const dataToInsert = transactions.map((tx) => {
      let matchedCategoryId: string | null = null;
      const descLower = tx.description.toLowerCase();

      // Check user rules
      for (const [keyword, catId] of ruleMap.entries()) {
        if (descLower.includes(keyword)) {
          matchedCategoryId = catId;
          break;
        }
      }

      // Fallback
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
        userId: userId, // 👈 CRITICAL: Add User ID to bulk insert
      };
    });

    const totalAmount = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );

    // C. Execute Transaction
    return this.prisma.$transaction([
      this.prisma.transaction.createMany({
        data: dataToInsert,
      }),
      this.prisma.account.update({
        where: { id: accountId, userId }, // 🔒 Security check
        data: {
          balance: { increment: totalAmount },
        },
      }),
    ]);
  }
}
