import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';

@Injectable()
export class CategoryRulesService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateCategoryRuleDto) {
    return this.prisma.categoryRule.create({
      data: { ...dto, userId },
      include: { category: true },
    });
  }

  findAll(userId: string) {
    return this.prisma.categoryRule.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const rule = await this.prisma.categoryRule.findUnique({ where: { id } });
    if (!rule || rule.userId !== userId) throw new NotFoundException();
    return rule;
  }

  async update(userId: string, id: string, dto: UpdateCategoryRuleDto) {
    await this.findOne(userId, id);
    return this.prisma.categoryRule.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.categoryRule.delete({ where: { id } });
  }
}
