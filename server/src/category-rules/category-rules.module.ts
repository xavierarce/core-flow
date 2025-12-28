import { Module } from '@nestjs/common';
import { CategoryRulesService } from './category-rules.service';
import { CategoryRulesController } from './category-rules.controller';

@Module({
  controllers: [CategoryRulesController],
  providers: [CategoryRulesService],
})
export class CategoryRulesModule {}
