import type { User } from '@prisma/client';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryRulesService } from './category-rules.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('category-rules')
@UseGuards(AuthGuard)
export class CategoryRulesController {
  constructor(private readonly categoryRulesService: CategoryRulesService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createCategoryRuleDto: CreateCategoryRuleDto,
  ) {
    return this.categoryRulesService.create(user.id, createCategoryRuleDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.categoryRulesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.categoryRulesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateCategoryRuleDto: UpdateCategoryRuleDto,
  ) {
    return this.categoryRulesService.update(user.id, id, updateCategoryRuleDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.categoryRulesService.remove(user.id, id);
  }
}
