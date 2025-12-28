import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryRulesService } from './category-rules.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';

@Controller('category-rules')
export class CategoryRulesController {
  constructor(private readonly categoryRulesService: CategoryRulesService) {}

  @Post()
  create(@Body() createCategoryRuleDto: CreateCategoryRuleDto) {
    return this.categoryRulesService.create(createCategoryRuleDto);
  }

  @Get()
  findAll() {
    return this.categoryRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryRulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryRuleDto: UpdateCategoryRuleDto) {
    return this.categoryRulesService.update(+id, updateCategoryRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryRulesService.remove(+id);
  }
}
