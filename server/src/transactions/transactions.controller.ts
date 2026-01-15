import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, // 👈 Added
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '../auth/auth.guard'; // 👈 Import Guard
import { CurrentUser } from '../auth/user.decorator'; // 👈 Import Decorator
import type { User } from '@prisma/client'; // 👈 Import Type (Note the 'type' keyword!)

@Controller('transactions')
@UseGuards(AuthGuard) // 🔒 Protect ENTIRE controller
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: User, // 👈 Get User
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    // Pass user.id to service
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User, // 👈 Get User
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.transactionsService.findAll(user.id, start, end);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
  ) {
    return this.transactionsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, user.id, updateTransactionDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
  ) {
    return this.transactionsService.remove(id, user.id);
  }

  @Post(':accountId/import')
  import(
    @CurrentUser() user: User, // 👈 Get User
    @Param('accountId') accountId: string,
    @Body() body: any[],
  ) {
    return this.transactionsService.import(user.id, accountId, body);
  }
}
