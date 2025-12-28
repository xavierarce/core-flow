import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';

@Injectable()
export class CategoryRulesService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryRuleDto: CreateCategoryRuleDto) {
    return 'This action adds a new categoryRule';
  }

  // 1. Get all rules (and include the category details so we can see the color)
  findAll() {
    return this.prisma.categoryRule.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }, // Newest rules first
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryRule`;
  }

  update(id: number, updateCategoryRuleDto: UpdateCategoryRuleDto) {
    return `This action updates a #${id} categoryRule`;
  }

  // 2. Delete a rule
  remove(id: string) {
    return this.prisma.categoryRule.delete({
      where: { id },
    });
  }
}
