import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TransactionSource } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  // 👇 Ensure this is here
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsNotEmpty()
  date: string;

  // 👇 ADD THIS FIELD
  @IsOptional()
  @IsEnum(TransactionSource)
  source?: TransactionSource;
}
