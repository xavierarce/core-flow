import type { User } from '@prisma/client'; // 👈 Add 'type' keyword

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../auth/auth.guard'; // 👈 Import Guard
import { CurrentUser } from '../auth/user.decorator'; // 👈 Import Decorator

@Controller('accounts')
@UseGuards(AuthGuard) // 🔒 Protect ENTIRE controller
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @CurrentUser() user: User, // 👈 Get User from Request
    @Body() createAccountDto: CreateAccountDto,
  ) {
    // Pass user.id (UUID) to the service
    return this.accountsService.create(user.id, createAccountDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User, // 👈 Get User
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.accountsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
  ) {
    return this.accountsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, user.id, updateAccountDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User, // 👈 Get User
    @Param('id') id: string,
  ) {
    return this.accountsService.remove(id, user.id);
  }
}
