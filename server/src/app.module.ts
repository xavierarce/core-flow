import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { CategoryRulesModule } from './category-rules/category-rules.module';

@Module({
  imports: [PrismaModule, AccountsModule, TransactionsModule, CategoriesModule, CategoryRulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
