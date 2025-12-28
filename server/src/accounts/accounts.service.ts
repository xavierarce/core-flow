import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { GetAccountsQueryDto } from 'src/transactions/dto/get-transaction.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  create(createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: createAccountDto,
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

  update(id: string, updateAccountDto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  remove(id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }
}
