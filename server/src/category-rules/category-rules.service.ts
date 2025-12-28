import { Injectable } from '@nestjs/common';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';

@Injectable()
export class CategoryRulesService {
  create(createCategoryRuleDto: CreateCategoryRuleDto) {
    return 'This action adds a new categoryRule';
  }

  findAll() {
    return `This action returns all categoryRules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryRule`;
  }

  update(id: number, updateCategoryRuleDto: UpdateCategoryRuleDto) {
    return `This action updates a #${id} categoryRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryRule`;
  }
}
