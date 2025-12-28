import { Module } from '@nestjs/common';
import { CategoryRulesService } from './category-rules.service';
import { CategoryRulesController } from './category-rules.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryRulesController],
  providers: [CategoryRulesService],
})
export class CategoryRulesModule {}
