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

  async findAll(query?: GetAccountsQueryDto) {
    const orderBy = query?.orderBy || 'name';
    const txOrder = query?.transactionsOrder || 'desc';

    return this.prisma.account.findMany({
      orderBy: {
        [orderBy]: 'asc',
      },
      include: {
        transactions: {
          orderBy: {
            date: txOrder,
          },
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
