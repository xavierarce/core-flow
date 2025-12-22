import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  create(createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: createAccountDto,
    });
  }

  findAll() {
    return this.prisma.account.findMany();
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
